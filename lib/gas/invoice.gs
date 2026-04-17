/**
 * BizAssist AI - 明細書自動生成 GAS スクリプト（インボイス対応）
 */

// ==============================
// 設定（ここを変更してください）
// ==============================
var FOLDER_ID    = 'YOUR_GOOGLE_DRIVE_FOLDER_ID'
var COMPANY_NAME = 'ハッピーステート株式会社'
var COMPANY_ZIP  = '〒066-0000'
var COMPANY_ADDR = '北海道千歳市'
var COMPANY_TEL  = '000-0000-0000'
var COMPANY_EMAIL= 'uedayoshie1@gmail.com'

// ==============================
// POST受信
// ==============================
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents)
    var info       = payload.info
    var items      = payload.items
    var subtotal10 = payload.subtotal10
    var subtotal8  = payload.subtotal8
    var tax10      = payload.tax10
    var tax8       = payload.tax8
    var total      = payload.total

    var folder = DriveApp.getFolderById(FOLDER_ID)
    var ssName = '明細書_' + (info.subject || info.issueDate) + '_' + (info.invoiceTo || '宛先未設定')
    var ss   = SpreadsheetApp.create(ssName)
    var file = DriveApp.getFileById(ss.getId())
    folder.addFile(file)
    DriveApp.getRootFolder().removeFile(file)

    var sheet = ss.getActiveSheet()
    sheet.setName('明細書')

    buildSheet(sheet, info, items, subtotal10, subtotal8, tax10, tax8, total)

    SpreadsheetApp.flush()
    Utilities.sleep(3000)

    var pdfBlob = ss.getAs('application/pdf').setName(ssName + '.pdf')
    var pdfFile = folder.createFile(pdfBlob)
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

// ==============================
// シート構築
// ==============================
function buildSheet(sheet, info, items, subtotal10, subtotal8, tax10, tax8, total) {
  sheet.clear()
  sheet.setHiddenGridlines(true)

  // 列幅
  sheet.setColumnWidth(1, 20)   // A: 余白
  sheet.setColumnWidth(2, 220)  // B: 商品名
  sheet.setColumnWidth(3, 50)   // C: 軽減税率
  sheet.setColumnWidth(4, 50)   // D: 数量
  sheet.setColumnWidth(5, 40)   // E: 単位
  sheet.setColumnWidth(6, 80)   // F: 単価
  sheet.setColumnWidth(7, 90)   // G: 金額
  sheet.setColumnWidth(8, 20)   // H: 余白

  var f = function(n) { return Number(n).toLocaleString('ja-JP') }

  // ===== タイトル =====
  var titleCell = sheet.getRange('B1:G1')
  titleCell.merge().setValue('支　払　明　細　書')
    .setFontSize(18).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
  sheet.setRowHeight(1, 50)

  // ===== 発行日（右上）=====
  sheet.getRange('F2:G2').merge()
    .setValue('発行日　' + info.issueDate)
    .setFontSize(9).setHorizontalAlignment('right')

  // ===== 宛先 =====
  sheet.getRange('B3').setValue(info.invoiceTo ? info.invoiceTo + '　御中' : '　御中')
    .setFontSize(13).setFontWeight('bold')
  sheet.getRange('B3').setBorder(true, true, true, true, false, false, '#333333', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
  sheet.setRowHeight(3, 32)

  // ===== 登録番号 =====
  sheet.getRange('B4').setValue('登録番号：' + (info.registrationNo || ''))
    .setFontSize(9).setFontColor('#333333')
  sheet.getRange('B4').setBorder(true, true, true, true, false, false, '#333333', SpreadsheetApp.BorderStyle.SOLID)
  sheet.setRowHeight(4, 24)

  // ===== 発行者（右側）=====
  sheet.getRange('F3:G3').merge().setValue(COMPANY_NAME)
    .setFontSize(10).setFontWeight('bold').setHorizontalAlignment('right')
  sheet.getRange('F4:G4').merge().setValue(COMPANY_ZIP + ' ' + COMPANY_ADDR)
    .setFontSize(8).setFontColor('#555555').setHorizontalAlignment('right')
  sheet.getRange('F5:G5').merge().setValue('TEL: ' + COMPANY_TEL)
    .setFontSize(8).setFontColor('#555555').setHorizontalAlignment('right')
  sheet.getRange('F6:G6').merge().setValue(COMPANY_EMAIL)
    .setFontSize(8).setFontColor('#555555').setHorizontalAlignment('right')

  // ===== ご挨拶文 =====
  sheet.getRange('B6:E6').merge()
    .setValue('以下の通りお支払い申し上げます。')
    .setFontSize(9).setFontColor('#555555')
  sheet.setRowHeight(6, 20)

  // ===== 件名 =====
  if (info.subject) {
    sheet.getRange('B7:G7').merge()
      .setValue('件名：' + info.subject)
      .setFontSize(10).setFontWeight('bold')
    sheet.getRange('B7:G7').setBorder(true, true, true, true, false, false, '#888888', SpreadsheetApp.BorderStyle.SOLID)
    sheet.setRowHeight(7, 28)
  }

  // ===== 合計金額ボックス =====
  var totalRow = 9
  sheet.getRange('B' + totalRow + ':F' + totalRow).merge()
    .setValue('合計金額（税込み）')
    .setFontSize(12).setFontWeight('bold')
    .setBackground('#dddddd')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, false, false, '#333333', SpreadsheetApp.BorderStyle.SOLID)
  sheet.getRange('G' + totalRow)
    .setValue('¥' + f(total))
    .setFontSize(12).setFontWeight('bold')
    .setHorizontalAlignment('right').setVerticalAlignment('middle')
    .setBorder(true, true, true, true, false, false, '#333333', SpreadsheetApp.BorderStyle.SOLID)
  sheet.setRowHeight(totalRow, 36)

  // ===== 明細テーブルヘッダー =====
  var hRow = 11
  sheet.setRowHeight(hRow, 36)
  var hBg = '#bbbbbb'
  var hHeaders = [
    ['B', '商品名'],
    ['C', '軽減税率\n対象'],
    ['D', '数量'],
    ['E', '単位'],
    ['F', '単価'],
    ['G', '金額'],
  ]
  hHeaders.forEach(function(h) {
    sheet.getRange(h[0] + hRow)
      .setValue(h[1])
      .setBackground(hBg).setFontSize(8).setFontWeight('bold')
      .setHorizontalAlignment('center').setVerticalAlignment('middle')
      .setWrap(true)
      .setBorder(true, true, true, true, false, false, '#888888', SpreadsheetApp.BorderStyle.SOLID)
  })

  // ===== 明細行 =====
  var MAX_ROWS = 20
  for (var i = 0; i < MAX_ROWS; i++) {
    var row = hRow + 1 + i
    sheet.setRowHeight(row, 20)
    var bg = '#ffffff'
    var item = i < items.length ? items[i] : null

    var cols = ['B','C','D','E','F','G']
    cols.forEach(function(col) {
      sheet.getRange(col + row)
        .setBackground(bg).setFontSize(9)
        .setBorder(true, true, true, true, false, false, '#cccccc', SpreadsheetApp.BorderStyle.SOLID)
    })

    if (item) {
      sheet.getRange('B' + row).setValue(item.name)
      sheet.getRange('C' + row)
        .setValue(item.taxRate === 8 ? '※' : '')
        .setHorizontalAlignment('center')
      sheet.getRange('D' + row).setValue(item.quantity).setHorizontalAlignment('center')
      sheet.getRange('E' + row).setValue(item.unit).setHorizontalAlignment('center')
      sheet.getRange('F' + row).setValue(item.unitPrice).setNumberFormat('#,##0').setHorizontalAlignment('right')
      sheet.getRange('G' + row).setValue(item.amount).setNumberFormat('#,##0').setHorizontalAlignment('right')
    }
  }

  // ===== 小計・税・合計 =====
  var lastDataRow = hRow + MAX_ROWS
  var sumRow = lastDataRow + 1

  var has8 = subtotal8 > 0

  var summaryRows = has8
    ? [
        ['小計（10%対象）', subtotal10],
        ['小計（8%対象）',  subtotal8],
        ['10%消費税',       tax10],
        ['8%消費税',        tax8],
        ['合計',            total],
      ]
    : [
        ['小計',        subtotal10],
        ['消費税（10%）', tax10],
        ['合計',         total],
      ]

  summaryRows.forEach(function(sr, idx) {
    var r = sumRow + idx
    var isTotal = idx === summaryRows.length - 1
    sheet.setRowHeight(r, 20)
    sheet.getRange('F' + r).setValue(sr[0])
      .setFontSize(9).setHorizontalAlignment('right')
      .setFontWeight(isTotal ? 'bold' : 'normal')
    sheet.getRange('G' + r).setValue(isTotal ? '¥' + f(sr[1]) : sr[1])
      .setNumberFormat(isTotal ? '' : '#,##0')
      .setFontSize(9).setHorizontalAlignment('right')
      .setFontWeight(isTotal ? 'bold' : 'normal')
    if (isTotal) {
      sheet.getRange('F' + r + ':G' + r)
        .setBorder(true, true, true, true, false, false, '#333333', SpreadsheetApp.BorderStyle.SOLID)
    }
  })

  // ===== ※軽減税率の注記 =====
  if (has8) {
    var noteRow = sumRow + summaryRows.length + 1
    sheet.getRange('B' + noteRow + ':G' + noteRow).merge()
      .setValue('※印は軽減税率（8%）対象商品')
      .setFontSize(8).setFontColor('#666666')
    sheet.setRowHeight(noteRow, 18)
  }

  // ===== 支払期限 =====
  if (info.dueDate) {
    var dueRow = sumRow + summaryRows.length + (has8 ? 3 : 2)
    sheet.getRange('B' + dueRow + ':G' + dueRow).merge()
      .setValue('お支払期限：' + info.dueDate)
      .setFontSize(9).setFontColor('#333333')
    sheet.setRowHeight(dueRow, 20)
  }

  // ===== 備考 =====
  var memoStartRow = sumRow + summaryRows.length + (has8 ? 4 : 3) + (info.dueDate ? 1 : 0)
  sheet.getRange('B' + memoStartRow).setValue('備考')
    .setFontSize(9).setFontWeight('bold').setFontColor('#666666')
  sheet.setRowHeight(memoStartRow, 18)
  if (info.memo) {
    sheet.getRange('B' + (memoStartRow + 1) + ':G' + (memoStartRow + 3)).merge()
      .setValue(info.memo).setFontSize(9).setWrap(true)
  }
}

// ==============================
// 動作確認用
// ==============================
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'BizAssist AI 明細書GAS is running' }))
    .setMimeType(ContentService.MimeType.JSON)
}
