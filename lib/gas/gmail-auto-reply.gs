/**
 * BizAssist AI - Gmail自動返信下書き保存スクリプト
 * Gemini AIがメール内容を読んで返信文を生成し、下書きに保存します
 *
 * 【セットアップ手順】
 * 1. Google AI Studio でGemini APIキーを取得
 *    → https://aistudio.google.com/app/apikey
 * 2. GEMINI_API_KEY に貼り付け
 * 3. 自分の名前・会社名・メールを設定
 * 4. 「保存」後、setUpTrigger() を一度だけ手動実行
 * 5. Gmailの権限を承認して完了
 */

// ==============================
// 設定（ここを変更してください）
// ==============================
var GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'  // Google AI Studioで取得
var MY_EMAIL       = 'uedayoshie1@gmail.com'
var MY_NAME        = '上田 良江'
var COMPANY_NAME   = 'ハッピーステート株式会社'
var COMPANY_TEL    = '000-0000-0000'

var MAX_EMAILS      = 5    // 1回の実行で処理するメール数
var TRIGGER_MINUTES = 15   // 何分ごとに実行するか（15 or 30 or 60）

// 処理済みにつけるGmailラベル名
var PROCESSED_LABEL = 'AI返信済み'

// 対象外にしたいメールアドレス（自動メールなど）
var SKIP_SENDERS = [
  'no-reply',
  'noreply',
  'newsletter',
  'notification',
  'mailer-daemon',
]

// ==============================
// メイン処理（自動実行される）
// ==============================
function checkAndReplyEmails() {
  var label = getOrCreateLabel(PROCESSED_LABEL)
  var processed = 0
  var skipped = 0

  var query = 'is:unread -label:' + PROCESSED_LABEL
  var threads = GmailApp.search(query, 0, MAX_EMAILS)

  if (threads.length === 0) {
    Logger.log('未処理の未読メールはありませんでした')
    return { processed: 0, skipped: 0 }
  }

  Logger.log(threads.length + '件のメールを処理します')

  threads.forEach(function(thread) {
    try {
      var messages = thread.getMessages()
      var lastMsg  = messages[messages.length - 1]
      var fromAddr = lastMsg.getFrom()

      // 自分のメールはスキップ
      if (fromAddr.indexOf(MY_EMAIL) >= 0) {
        thread.addLabel(label)
        skipped++
        return
      }

      // スキップ対象の送信者はスキップ
      var skipFlag = false
      SKIP_SENDERS.forEach(function(s) {
        if (fromAddr.toLowerCase().indexOf(s) >= 0) skipFlag = true
      })
      if (skipFlag) {
        thread.addLabel(label)
        skipped++
        return
      }

      var subject    = lastMsg.getSubject() || '（件名なし）'
      var body       = lastMsg.getPlainBody() || ''
      var senderName = fromAddr.replace(/<[^>]*>/, '').replace(/"/g, '').trim() || fromAddr

      Logger.log('処理中: ' + subject + ' / from: ' + senderName)

      var replyText = generateReply(subject, body, senderName)

      if (!replyText) {
        Logger.log('返信文の生成に失敗しました: ' + subject)
        skipped++
        return
      }

      GmailApp.createDraft(
        lastMsg.getFrom(),
        'Re: ' + subject,
        replyText,
        { name: MY_NAME + '（' + COMPANY_NAME + '）', replyTo: MY_EMAIL }
      )

      thread.addLabel(label)
      processed++
      Logger.log('下書き保存完了: ' + subject)

    } catch (err) {
      Logger.log('エラー: ' + err.message)
      skipped++
    }
  })

  return { processed: processed, skipped: skipped }
}

// ==============================
// Gemini AIで返信文を生成
// ==============================
function generateReply(subject, body, senderName) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY

  // メール本文が長すぎる場合は最初の1500文字に絞る
  var trimmedBody = body.length > 1500 ? body.slice(0, 1500) + '…' : body

  var prompt = [
    'あなたは「' + MY_NAME + '（' + COMPANY_NAME + '）」の秘書として、',
    '受信したメールに対する返信の下書きを作成するアシスタントです。',
    '',
    '以下のメールを読んで、相手の内容・質問・要望に対して丁寧かつ自然な日本語で返信文を作成してください。',
    '',
    '【ルール】',
    '- 相手の氏名がわかる場合は「〇〇様」と書き出す',
    '- 「お世話になっております。' + COMPANY_NAME + 'の' + MY_NAME + 'です。」から始める',
    '- メールの内容・質問・要望に具体的に答える',
    '- 決定できないことは「確認の上、改めてご連絡いたします」と伝える',
    '- 最後は「よろしくお願いいたします。」で締める',
    '- 署名は不要（自動で付加されます）',
    '- 本文のみ出力すること',
    '',
    '【受信メール情報】',
    '送信者：' + senderName,
    '件名：' + subject,
    '本文：',
    trimmedBody,
    '',
    '返信文：',
  ].join('\n')

  var payload = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 1000,
    }
  }

  try {
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    })

    var result = JSON.parse(response.getContentText())

    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      var replyBody = result.candidates[0].content.parts[0].text

      // 署名を追加
      var signature = [
        '',
        '━━━━━━━━━━━━━━━━━━',
        MY_NAME,
        COMPANY_NAME,
        'Email: ' + MY_EMAIL,
        'TEL: ' + COMPANY_TEL,
        '━━━━━━━━━━━━━━━━━━',
      ].join('\n')

      return replyBody + signature
    }

    // エラーレスポンスをログに記録
    Logger.log('Gemini APIレスポンス: ' + response.getContentText())
    return null

  } catch (err) {
    Logger.log('Gemini APIエラー: ' + err.message)
    return null
  }
}

// ==============================
// ラベルを取得または作成
// ==============================
function getOrCreateLabel(labelName) {
  var labels = GmailApp.getUserLabels()
  for (var i = 0; i < labels.length; i++) {
    if (labels[i].getName() === labelName) return labels[i]
  }
  return GmailApp.createLabel(labelName)
}

// ==============================
// アプリからの手動実行用エンドポイント
// ==============================
function doPost(e) {
  try {
    var result = checkAndReplyEmails()
    return ContentService
      .createTextOutput(JSON.stringify(result || { processed: 0, skipped: 0 }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ processed: 0, skipped: 0, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'BizAssist AI Gmail自動返信 is running' }))
    .setMimeType(ContentService.MimeType.JSON)
}

// ==============================
// トリガー設定（最初に一度だけ手動実行）
// ==============================
function setUpTrigger() {
  // 既存の同名トリガーを削除
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'checkAndReplyEmails') {
      ScriptApp.deleteTrigger(t)
    }
  })

  // 指定分ごとに自動実行するトリガーを作成
  ScriptApp.newTrigger('checkAndReplyEmails')
    .timeBased()
    .everyMinutes(TRIGGER_MINUTES)
    .create()

  Logger.log('トリガー設定完了：' + TRIGGER_MINUTES + '分ごとに自動実行されます')
}

// ==============================
// トリガー停止（一時停止したい時）
// ==============================
function stopTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'checkAndReplyEmails') {
      ScriptApp.deleteTrigger(t)
    }
  })
  Logger.log('トリガーを停止しました')
}

// ==============================
// 動作テスト（手動で1件だけ試す）
// ==============================
function testOnce() {
  var threads = GmailApp.search('is:unread -label:' + PROCESSED_LABEL, 0, 1)
  if (threads.length === 0) {
    Logger.log('未読メールがありません')
    return
  }
  var msg = threads[0].getMessages()[0]
  Logger.log('テスト対象: ' + msg.getSubject())
  var reply = generateReply(msg.getSubject(), msg.getPlainBody(), msg.getFrom())
  Logger.log('生成された返信文:\n' + reply)
}
