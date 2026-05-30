// ============================================================
//  Chat.gs - LLM呼び出し・FAQ応答・未解決登録
// ============================================================

// ------------------------------------------------------------
// チャット処理メイン
// ------------------------------------------------------------
function S_sendChat(text, email, role) {
  if (!text) return { success:false, message:'テキストが空です。' };

  // サーバー側でロール再判定
  const serverRole = S_getRoleByEmail(email);

  // FAQキャッシュ取得
  const faqAll      = S_getFaqCached();
  const faqFiltered = faqAll.filter(faq => S_canAccessFaq(faq['公開対象者'] || faq['targetAudience'], serverRole));

  // キーワード絞り込み（上位3件）
  const faqContext = S_searchFaqByKeyword(text, faqFiltered, 3);

  // システムプロンプト取得
  const systemPrompt = SETTINGS.SYSTEM_PROMPT || S_defaultSystemPrompt();

  // LLM呼び出し
  let llmRaw;
  try {
    llmRaw = S_callLLM(systemPrompt, faqContext, text);
  } catch(e) {
    Logger.log('LLM error: ' + e.message);
    S_writeLog(email, serverRole, 'CHAT', text.slice(0,100), '失敗');
    // エラー内容をフロントに返してデバッグしやすくする
    return { success:false, message:'AI処理でエラーが発生しました: ' + e.message };
  }

  // JSONパース
  let result;
  try {
    const clean = llmRaw.replace(/```json|```/g, '').trim();
    result = JSON.parse(clean);
  } catch(e) {
    Logger.log('LLM JSON parse error. raw: ' + llmRaw);
    // JSONでない場合はそのまま chat として返す（URLは除去）
    const cleanAnswer = llmRaw.replace(/https?:\/\/[^\s　、。）]+/g,'').trim();
    result = { type:'chat', answer:cleanAnswer, urls:[] };
  }

  S_writeLog(email, serverRole, 'CHAT', text.slice(0,100), '成功');

  // unresolved処理
  if (result.type === 'unresolved') {
    const receiptNo = S_saveUnresolved(text, email, serverRole);
    if (SETTINGS.UNRESOLVED_NOTIFY === 'TRUE' && SETTINGS.NOTIFY_EMAIL) {
      S_sendUnresolvedNotify(receiptNo, text, S_displayRole(serverRole));
    }
    return {
      success:   true,
      type:      'unresolved',
      answer:    '担当者が確認後に回答します。（受付番号: ' + receiptNo + '）',
      receiptNo: receiptNo,
      urls:      []
    };
  }

  return {
    success: true,
    type:    result.type  || 'chat',
    answer:  result.answer || '',
    urls:    result.urls  || []
  };
}

// ------------------------------------------------------------
// FAQ公開対象チェック
// ------------------------------------------------------------
function S_canAccessFaq(targetAudience, role) {
  if (!targetAudience || targetAudience === '全員') return true;
  const level = S_roleLevel(role);
  if (targetAudience === '学生のみ')     return role === 'student';
  if (targetAudience === '学生＋教職員') return level >= 1;
  if (targetAudience === '教職員のみ')   return level >= 2;
  return true;
}

// ------------------------------------------------------------
// FAQキーワード絞り込み
// ------------------------------------------------------------
function S_searchFaqByKeyword(text, faqList, limit) {
  const keywords = text.replace(/[、。！？\s]/g, ' ').split(' ')
    .map(k => k.trim()).filter(k => k.length >= 2);
  if (!keywords.length) return faqList.slice(0, limit);

  const scored = faqList.map(faq => {
    let score = 0;
    const target = [
      faq['質問（Q）'] || faq['question'] || '',
      faq['キーワード'] || faq['keywords'] || '',
      faq['想定質問バリエーション'] || faq['variations'] || ''
    ].join(' ');
    keywords.forEach(kw => { if (target.includes(kw)) score++; });
    return { faq, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.faq);
}

// ------------------------------------------------------------
// LLM呼び出し（プロバイダ切替）
// ------------------------------------------------------------
function S_callLLM(systemPrompt, faqContext, userInput) {
  const faqText = faqContext.map((f, i) => {
    // 回答文からURLを除去してLLMに渡す（URLはurlsフィールドで別途返す）
    const answer = (f['回答（A）'] || f['answer'] || '')
      .replace(/https?:\/\/[^\s　、。）]+/g, '').replace(/\s+/g,' ').trim();
    const sourceUrl = f['出典URL'] || f['sourceUrl'] || '';
    const urlLine = sourceUrl ? `\n出典URL: ${sourceUrl}` : '';
    return `[FAQ${i+1}]\nQ: ${f['質問（Q）']||f['question']||''}\nA: ${answer}${urlLine}`;
  }).join('\n\n');

  const prompt = systemPrompt
    .replace('{faqContext}', faqText || '（該当するFAQはありませんでした）')
    .replace('{userInput}',  userInput);

  const provider = SETTINGS.LLM_PROVIDER || 'gemini';
  switch (provider) {
    case 'gemini': return S_callGemini(prompt);
    case 'claude': return S_callClaude(prompt);
    case 'openai': return S_callOpenAI(prompt);
    default: throw new Error('未対応のLLMプロバイダ: ' + provider);
  }
}

function S_callGemini(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY が未設定です。');
  const model    = SETTINGS.GEMINI_MODEL || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload  = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json'  // JSON形式で返すよう指定
    }
  };
  const res = UrlFetchApp.fetch(endpoint, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  const raw  = res.getContentText();
  const json = JSON.parse(raw);
  Logger.log('Gemini status: ' + res.getResponseCode());
  if (!json.candidates) {
    Logger.log('Gemini error response: ' + raw.slice(0, 500));
    throw new Error('Gemini APIエラー: ' + raw.slice(0, 200));
  }
  const text = json.candidates[0].content.parts[0].text;
  Logger.log('Gemini raw response: ' + text.slice(0, 300));
  return text;
}

function S_callClaude(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) throw new Error('CLAUDE_API_KEY が未設定です。');
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method:'post',
    headers:{ 'x-api-key':apiKey, 'anthropic-version':'2023-06-01', 'content-type':'application/json' },
    payload:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{ role:'user', content:prompt }] }),
    muteHttpExceptions:true
  });
  const json = JSON.parse(res.getContentText());
  if (!json.content) throw new Error('Claude APIエラー: ' + res.getContentText());
  return json.content[0].text;
}

function S_callOpenAI(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY が未設定です。');
  const res = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
    method:'post',
    headers:{ 'Authorization':'Bearer '+apiKey, 'content-type':'application/json' },
    payload:JSON.stringify({ model:'gpt-4o', messages:[{ role:'user', content:prompt }] }),
    muteHttpExceptions:true
  });
  const json = JSON.parse(res.getContentText());
  if (!json.choices) throw new Error('OpenAI APIエラー: ' + res.getContentText());
  return json.choices[0].message.content;
}

// ------------------------------------------------------------
// デフォルトシステムプロンプト（設定シート未設定時のフォールバック）
// ------------------------------------------------------------
function S_defaultSystemPrompt() {
  return `あなたは鳥取大学のFAQアシスタントです。
以下のルールを必ず守ってください。

【ルール】
・日本語で丁寧かつ親しみやすく回答する
・以下のFAQデータを最優先で参照する
・FAQで回答できる場合は type: "faq" を返す
・挨拶・雑談・軽い質問は type: "chat" として自然に返す（未解決登録不要）
・FAQで回答できない質問は type: "unresolved" を返す
・音声読み上げ用のanswerにURLを絶対に含めない
・URLが必要な場合はurlsフィールドに配列で返す
・推測や不確かな情報で回答しない

【レスポンス形式（JSON厳守・他の文字を含めない）】
{"type":"faq"|"chat"|"unresolved"|"error","answer":"回答文","urls":[{"label":"ラベル","url":"https://..."}]}

【FAQデータ】
{faqContext}

【ユーザーの質問】
{userInput}`;
}

// ------------------------------------------------------------
// 未解決登録
// ------------------------------------------------------------
function S_saveUnresolved(question, email, role) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet     = S_getSheet('未解決');
    const lastRow   = Math.max(sheet.getLastRow() - 1, 0);
    const receiptNo = lastRow + 1;
    sheet.appendRow([
      receiptNo, question, email, S_displayRole(role),
      S_now(), '未回答', '', '', '', '未登録', ''
    ]);
    S_writeLog(email, role, 'UNRESOLVED_SAVE', question.slice(0,100), '成功');
    return receiptNo;
  } catch(e) {
    Logger.log('saveUnresolved error: ' + e.message);
    throw e;
  } finally {
    lock.releaseLock();
  }
}

// 未解決メール通知
function S_sendUnresolvedNotify(receiptNo, question, roleDisplay) {
  try {
    const notifyEmail = SETTINGS.NOTIFY_EMAIL;
    if (!notifyEmail) return;
    MailApp.sendEmail(
      notifyEmail,
      '【未解決】新しい質問が届きました（受付番号: ' + receiptNo + '）',
      '受付番号: ' + receiptNo + '\n質問者: ' + roleDisplay + '\n\n質問内容:\n' + question +
      '\n\nシステムにログインして回答してください。'
    );
  } catch(e) {
    Logger.log('未解決通知メールエラー: ' + e.message);
  }
}

// ------------------------------------------------------------
// 未解決一覧取得
// ------------------------------------------------------------
function S_fetchUnresolved(email) {
  const role = S_getRoleByEmail(email);
  if (S_roleLevel(role) < 2) return { success:false, message:'権限がありません。' };

  const sheet = S_getSheet('未解決');
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success:true, data:[] };

  const rows = data.slice(1)
    .filter(row => row[5] !== '回答済')
    .map(row => ({
      no:          row[0],
      question:    row[1],
      askerEmail:  row[2],
      askerRole:   row[3],
      askedAt:     row[4],
      status:      row[5],
      answer:      row[6] || ''
    }));

  return { success:true, data:rows };
}

// ------------------------------------------------------------
// 未解決回答登録
// ------------------------------------------------------------
function S_submitAnswer(receiptNo, answer, email) {
  const role = S_getRoleByEmail(email);
  if (S_roleLevel(role) < 2) return { success:false, message:'権限がありません。' };
  if (!answer) return { success:false, message:'回答内容を入力してください。' };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = S_getSheet('未解決');
    const data  = sheet.getDataRange().getValues();

    let targetRow = -1;
    let askerEmail = '';
    let question   = '';
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(receiptNo)) {
        targetRow  = i + 1;
        question   = data[i][1];
        askerEmail = data[i][2];
        break;
      }
    }
    if (targetRow < 0) return { success:false, message:'受付番号が見つかりません。' };

    // 未解決シート更新
    sheet.getRange(targetRow, 6).setValue('回答済');   // F: ステータス
    sheet.getRange(targetRow, 7).setValue(answer);     // G: 回答内容
    sheet.getRange(targetRow, 8).setValue(email);      // H: 回答者メアド
    sheet.getRange(targetRow, 9).setValue(S_now());    // I: 回答日時

    // 回答済みシートにコピー
    const resolvedSheet = S_getSheet('回答済み');
    resolvedSheet.appendRow(sheet.getRange(targetRow, 1, 1, 11).getValues()[0]);

    // 質問者へ通知
    if (askerEmail) {
      S_sendAnswerNotify(receiptNo, question, answer, askerEmail);
    }

    S_writeLog(email, role, 'ANSWER', '受付番号:' + receiptNo, '成功');
    return { success:true, message:'回答を登録しました。' };
  } catch(e) {
    Logger.log('submitAnswer error: ' + e.message);
    return { success:false, message:'処理が混み合っています。もう一度お試しください。' };
  } finally {
    lock.releaseLock();
  }
}

// 質問者へ回答通知メール
function S_sendAnswerNotify(receiptNo, question, answer, askerEmail) {
  try {
    MailApp.sendEmail(
      askerEmail,
      '【回答】ご質問への回答をお送りします（受付番号: ' + receiptNo + '）',
      '受付番号: ' + receiptNo + '\n\nご質問:\n' + question +
      '\n\n回答:\n' + answer + '\n\n鳥取大学FAQアシスタント'
    );
  } catch(e) {
    Logger.log('回答通知メールエラー: ' + e.message);
  }
}

// ------------------------------------------------------------
// 回答済み一覧取得
// ------------------------------------------------------------
function S_fetchResolved(email) {
  const role = S_getRoleByEmail(email);
  if (S_roleLevel(role) < 2) return { success:false, message:'権限がありません。' };

  const sheet = S_getSheet('回答済み');
  const data  = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success:true, data:[] };

  const rows = data.slice(1).map(row => ({
    no:         row[0],
    question:   row[1],
    askerRole:  row[3],
    askedAt:    row[4],
    answer:     row[6] || '',
    responder:  row[7] || '',
    answeredAt: row[8] || ''
  }));

  return { success:true, data:rows };
}

// ------------------------------------------------------------
// FAQ一覧取得（教職員・管理者）
// ------------------------------------------------------------
function S_fetchFaq(email) {
  const role = S_getRoleByEmail(email);
  if (S_roleLevel(role) < 2) return { success:false, message:'権限がありません。' };

  const faqAll = S_getFaqCached();
  const rows = faqAll.map(f => ({
    faqId:          f['FAQ-ID']       || f['faqId']          || '',
    category:       f['系統/カテゴリ'] || f['category']        || '',
    question:       f['質問（Q）']    || f['question']        || '',
    answer:         f['回答（A）']    || f['answer']          || '',
    keywords:       f['キーワード']   || f['keywords']        || '',
    sourceUrl:      f['出典URL']      || f['sourceUrl']       || '',
    targetAudience: f['公開対象者']   || f['targetAudience']  || '',
    availability:   f['利用可否']     || f['availability']    || '',
    createdDate:    f['作成日']       || f['createdDate']     || '',
    updatedDate:    f['更新日']       || f['updatedDate']     || ''
  }));

  return { success:true, data:rows };
}

// ------------------------------------------------------------
// FAQ追加
// ------------------------------------------------------------
function S_addFaqEntry(params, email) {
  const role = S_getRoleByEmail(email);
  if (S_roleLevel(role) < 2) return { success:false, message:'権限がありません。' };
  if (!params.question || !params.answer || !params.category) {
    return { success:false, message:'必須項目（カテゴリ・質問・回答）を入力してください。' };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const faqId = S_generateFaqId();
    const sheet = S_getSheet('FAQ管理');
    sheet.appendRow([
      faqId,
      params.category       || '',
      params.question,
      params.answer,
      params.keywords       || '',
      params.variations     || '',
      params.sourceUrl      || '',
      S_today(),
      S_today(),
      params.targetAudience || '全員',
      params.availability   || '使用中',
      email,
      '',
      params.remarks        || ''
    ]);
    S_clearCache('faq_all');
    S_writeLog(email, role, 'FAQ_ADD', faqId, '成功');
    return { success:true, message:'FAQを追加しました。', faqId };
  } catch(e) {
    return { success:false, message:'処理が混み合っています。もう一度お試しください。' };
  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------
// FAQ編集
// ------------------------------------------------------------
function S_editFaqEntry(params, email) {
  const role = S_getRoleByEmail(email);
  if (S_roleLevel(role) < 2) return { success:false, message:'権限がありません。' };
  if (!params.faqId) return { success:false, message:'FAQ-IDが指定されていません。' };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = S_getSheet('FAQ管理');
    const data  = sheet.getDataRange().getValues();

    let targetRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === params.faqId) { targetRow = i + 1; break; }
    }
    if (targetRow < 0) return { success:false, message:'FAQ-IDが見つかりません: ' + params.faqId };

    // 各列を更新（値がある場合のみ上書き）
    const updates = {
      2:  params.category,
      3:  params.question,
      4:  params.answer,
      5:  params.keywords,
      6:  params.variations,
      7:  params.sourceUrl,
      10: params.targetAudience,
      11: params.availability
    };
    Object.entries(updates).forEach(([col, val]) => {
      if (val !== undefined && val !== null) {
        sheet.getRange(targetRow, Number(col) + 1).setValue(val);
      }
    });
    sheet.getRange(targetRow, 10).setValue(S_today());   // I: 更新日
    sheet.getRange(targetRow, 14).setValue(email);        // M: 更新者メアド

    S_clearCache('faq_all');
    S_writeLog(email, role, 'FAQ_EDIT', params.faqId, '成功');
    return { success:true, message:'FAQを更新しました。' };
  } catch(e) {
    return { success:false, message:'処理が混み合っています。もう一度お試しください。' };
  } finally {
    lock.releaseLock();
  }
}
