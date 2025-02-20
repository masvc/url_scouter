<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// デバッグログ用関数
function debugLog($message, $data = null)
{
    error_log(sprintf("[URLスカウター] %s: %s", $message, json_encode($data)));
}

// 出力バッファリングを開始
ob_start();

// libxmlのエラーハンドリングを設定
libxml_use_internal_errors(true);

// エラーハンドリング
function handleError($message)
{
    debugLog("エラー発生", $message);
    // 出力バッファをクリア
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => $message]);
    exit;
}

try {
    // POSTリクエストの確認
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        handleError('Invalid request method');
    }

    // URLの取得と検証
    $url = filter_input(INPUT_POST, 'url', FILTER_VALIDATE_URL);
    debugLog("受信したURL", $url);

    if (!$url) {
        handleError('Invalid URL');
    }

    // URLの内容を取得
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ]
    ]);
    $html = @file_get_contents($url, false, $context);
    if ($html === false) {
        handleError('Could not fetch URL');
    }

    // DOMDocumentを使用してHTMLを解析
    $doc = new DOMDocument();
    // 文字エンコーディングを明示的に設定
    $html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
    @$doc->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
    $xpath = new DOMXPath($doc);

    // libxmlエラーをクリア
    libxml_clear_errors();

    // SEO評価（1-5）
    function evaluateSEO($xpath, $doc)
    {
        $score = 1; // 基本スコア

        // メタタグのチェック
        $title = $xpath->query('//title')->length > 0;
        $description = $xpath->query('//meta[@name="description"]')->length > 0;
        if ($title && $description) $score++;

        // 見出し構造のチェック
        $h1 = $xpath->query('//h1')->length > 0;
        $headings = $xpath->query('//h2|//h3|//h4')->length > 0;
        if ($h1 && $headings) $score++;

        // モバイルビューポートのチェック
        if ($xpath->query('//meta[@name="viewport"]')->length > 0) $score++;

        // 画像のalt属性チェック
        $images = $xpath->query('//img');
        $validAltCount = 0;
        foreach ($images as $img) {
            if ($img->hasAttribute('alt')) $validAltCount++;
        }
        if ($images->length > 0 && ($validAltCount / $images->length) > 0.8) $score++;

        return $score;
    }

    // コンテンツ評価（1-5）
    function evaluateContent($xpath, $doc)
    {
        $score = 1; // 基本スコア

        // 基本的な情報の存在チェック
        $hasContact = $xpath->query('//*[contains(translate(text(), "CONTACT", "contact"), "contact")]')->length > 0;
        $hasAbout = $xpath->query('//*[contains(translate(text(), "ABOUT", "about"), "about")]')->length > 0;
        if ($hasContact || $hasAbout) $score++;

        // コンテンツの量をチェック
        $textContent = $xpath->query('//p|//article')->length;
        if ($textContent > 10) $score++;
        if ($textContent > 20) $score++;

        // リンクの存在チェック
        $links = $xpath->query('//a[@href]')->length;
        if ($links > 10) $score++;

        return $score;
    }

    // デザイン評価（1-5）
    function evaluateDesign($xpath, $doc)
    {
        $score = 1; // 基本スコア

        // レスポンシブデザインチェック
        if ($xpath->query('//meta[@name="viewport"]')->length > 0) $score++;

        // CSSの使用チェック
        $hasStyles = $xpath->query('//link[@rel="stylesheet"]|//style')->length > 0;
        if ($hasStyles) $score++;

        // 適切なマークアップ構造
        $hasHeader = $xpath->query('//header')->length > 0;
        $hasFooter = $xpath->query('//footer')->length > 0;
        $hasNav = $xpath->query('//nav')->length > 0;
        if (($hasHeader && $hasFooter) || $hasNav) $score++;

        // インタラクティブ要素
        $hasButtons = $xpath->query('//button')->length > 0;
        $hasForms = $xpath->query('//form')->length > 0;
        if ($hasButtons || $hasForms) $score++;

        return $score;
    }

    // 評価の実行
    $results = [
        'seo' => evaluateSEO($xpath, $doc),
        'content' => evaluateContent($xpath, $doc),
        'design' => evaluateDesign($xpath, $doc)
    ];

    // 結果の保存
    $resultsDir = __DIR__ . "/results";
    if (!file_exists($resultsDir)) {
        // ディレクトリ作成を試みる
        if (!mkdir($resultsDir, 0777, true)) {
            debugLog("ディレクトリ作成失敗", [
                'dir' => $resultsDir,
                'error' => error_get_last()
            ]);
            handleError('結果保存用ディレクトリの作成に失敗しました');
        }
        // 作成後にパーミッションを確実に設定
        chmod($resultsDir, 0777);
    }

    // ファイルの書き込み権限を確認
    if (!is_writable($resultsDir)) {
        debugLog("書き込み権限なし", [
            'dir' => $resultsDir,
            'perms' => substr(sprintf('%o', fileperms($resultsDir)), -4)
        ]);
        handleError('結果保存用ディレクトリに書き込み権限がありません');
    }

    $id = uniqid();
    $resultsFile = "{$resultsDir}/{$id}.json";

    $resultData = [
        'url' => $url,
        'timestamp' => time(),
        'results' => $results
    ];

    debugLog("保存するデータ", [
        'file' => $resultsFile,
        'data' => $resultData
    ]);

    // ファイル書き込みを試行
    if (file_put_contents($resultsFile, json_encode($resultData)) === false) {
        debugLog("ファイル書き込み失敗", [
            'file' => $resultsFile,
            'error' => error_get_last()
        ]);
        handleError('結果の保存に失敗しました');
    }

    // 結果のIDを返す前に出力バッファをクリア
    ob_clean();
    $response = ['id' => $id];
    debugLog("返却するレスポンス", $response);
    echo json_encode($response);
} catch (Exception $e) {
    debugLog("予期せぬエラー", $e->getMessage());
    handleError($e->getMessage());
}
