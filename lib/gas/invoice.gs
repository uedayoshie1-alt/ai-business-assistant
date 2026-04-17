/**
 * BizAssist AI - 明細書自動生成 GAS スクリプト
 */

// ==============================
// 設定（ここを変更してください）
// ==============================
const FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID' // 明細書を保存するフォルダのID
const COMPANY_NAME = 'ハッピーステート株式会社'
const COMPANY_ADDRESS = '北海道千歳市'
const COMPANY_TEL = '000-0000-0000'
const COMPANY_EMAIL = 'uedayoshie1@gmail.com'

// ==============================
// メイン処理
// ==============================
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents)
    const { info, items, subtotal, tax, total } = payload

    // スプレッドシートを新規作成
    const folder = DriveApp.getFolderById(FOLDER_ID)
    const ssName = '明細書_' + info.invoiceNumber + '_' + (info.invoiceTo || '宛先未設定')
    const ss = SpreadsheetApp.create(ssName)

    // マイドライブから指定フォルダへ移動
    const file = DriveApp.getFileById(ss.getId())
    folder.addFile(file)
    DriveApp.getRootFolder().removeFile(file)

    const sheet = ss.getActiveSheet()
    sheet.setName('明細書')

    // シートにデータを書き込む
    buildInvoiceSheet(sheet, info, items, subtotal, tax, total)

    // ★ 書き込みを確定してからPDF化
    SpreadsheetApp.flush()
    Utilities.sleep(2000)

    // PDF化して同じフォルダに保存
    const pdfBlob = ss.getAs('application/pdf').setName(ssName + '.pdf')
    const pdfFile = folder.createFile(pdfBlob)
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)

    return ContentService
      .createTextOutput(JSON.stringify({ url: pdfFile.getUrl() }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function buildInvoiceSheet(sheet, info, items, subtotal, tax, total) {
  sheet.clear()

  // 列幅設定
  sheet.setColumnWidth(1, 30)
  sheet.setColumnWidth(2, 200)
  sheet.setColumnWidth(3, 80)
  sheet.setColumnWidth(4, 100)
  sheet.setColumnWidth(5, 110)
  sheet.setColumnWidth(6, 30)

  var fmt = function(n) { return '¥' + Number(n).toLocaleString('ja-JP') }

  // --- タイトル ---
  sheet.getRange('B1').setValue('明　細　書').setFontSize(20).setFontWeight('bold')
  sheet.getRange('B2').setValue(COMPANY_NAME).setFontSize(10)
  sheet.getRange('B3').setValue(COMPANY_ADDRESS).setFontSize(9).setFontColor('#666666')
  sheet.getRange('B4').setValue('TEL: ' + COMPANY_TEL + '　Email: ' + COMPANY_EMAIL).setFontSize(9).setFontColor('#666666')

  // --- 宛先 ---
  sheet.getRange('B6').setValue(info.invoiceTo || '　').setFontSize(13).setFontWeight('bold')
  sheet.getRange('B7').setValue('御中').setFontSize(11)

  // --- 明細番号・日付 ---
  sheet.getRange('E1').setValue('明細番号').setFontSize(9).setFontColor('#666666')
  sheet.getRange('F1').setValue(info.invoiceNumber).setFontSize(9)
  sheet.getRange('E2').setValue('発行日').setFontSize(9).setFontColor('#666666')
  sheet.getRange('F2').setValue(info.issueDate).setFontSize(9)
  sheet.getRange('E3').setValue('支払期限').setFontSize(9).setFontColor('#666666')
  sheet.getRange('F3').setValue(info.dueDate || '').setFontSize(9)

  // --- 合計金額ボックス ---
  sheet.getRange('B9:E9').merge()
    .setValue('合計金額：' + fmt(total))
    .setFontSize(14).setFontWeight('bold')
    .setBackground('#0f766e').setFontColor('#ffffff')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
  sheet.setRowHeight(9, 40)

  // --- 明細ヘッダー ---
  var headerRow = 11
  var headerLabels = ['品名・摘要', '数量', '単価', '金額', '']
  for (var h = 0; h < headerLabels.length; h++) {
    sheet.getRange(headerRow, h + 2).setValue(headerLabels[h])
      .setBackground('#134e4a').setFontColor('#ffffff').setFontWeight('bold').setFontSize(9)
      .setHorizontalAlignment('center').setVerticalAlignment('middle')
  }
  sheet.setRowHeight(headerRow, 28)

  // --- 明細行 ---
  for (var i = 0; i < items.length; i++) {
    var item = items[i]
    var row = headerRow + 1 + i
    var bg = i % 2 === 0 ? '#f0fdfa' : '#ffffff'
    sheet.getRange(row, 2).setValue(item.name).setBackground(bg).setFontSize(9)
    sheet.getRange(row, 3).setValue(item.quantity).setBackground(bg).setHorizontalAlignment('center').setFontSize(9)
    sheet.getRange(row, 4).setValue(item.unitPrice).setBackground(bg).setNumberFormat('#,##0').setHorizontalAlignment('right').setFontSize(9)
    sheet.getRange(row, 5).setValue(item.amount).setBackground(bg).setNumberFormat('#,##0').setHorizontalAlignment('right').setFontSize(9)
    sheet.setRowHeight(row, 24)
  }

  // --- 小計・税・合計 ---
  var sumStartRow = headerRow + items.length + 2

  sheet.getRange(sumStartRow, 4).setValue('小計').setFontSize(9).setHorizontalAlignment('right')
  sheet.getRange(sumStartRow, 5).setValue(subtotal).setNumberFormat('#,##0').setHorizontalAlignment('right').setFontSize(9)
  sheet.getRange(sumStartRow + 1, 4).setValue('消費税（10%）').setFontSize(9).setHorizontalAlignment('right')
  sheet.getRange(sumStartRow + 1, 5).setValue(tax).setNumberFormat('#,##0').setHorizontalAlignment('right').setFontSize(9)

  var totalRow = sumStartRow + 2
  sheet.getRange(totalRow, 4).setValue('合計').setFontWeight('bold').setFontSize(10).setHorizontalAlignment('right')
  sheet.getRange(totalRow, 5).setValue(total)
    .setFontWeight('bold').setNumberFormat('#,##0').setHorizontalAlignment('right').setFontSize(10)
    .setBackground('#0f766e').setFontColor('#ffffff')

  // --- 備考 ---
  if (info.memo) {
    var memoRow = totalRow + 2
    sheet.getRange(memoRow, 2).setValue('備考').setFontWeight('bold').setFontSize(9).setFontColor('#666666')
    sheet.getRange(memoRow + 1, 2, 1, 4).merge().setValue(info.memo).setFontSize(9).setWrap(true)
  }
}

// ==============================
// GET リクエスト（動作確認用）
// ==============================
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'BizAssist AI 明細書GAS is running' }))
    .setMimeType(ContentService.MimeType.JSON)
}
