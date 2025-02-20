<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

function debugLog($message, $data = null)
{
    error_log(sprintf("[URLスカウター] %s: %s", $message, json_encode($data)));
}

// IDの取得と検証
// FILTER_SANITIZE_STRINGは非推奨なので、別の方法で検証します
$id = filter_input(INPUT_GET, 'id');
if ($id) {
    // 英数字とハイフンのみを許可
    $id = preg_replace('/[^a-zA-Z0-9-]/', '', $id);
}
debugLog("リクエストされたID", $id);

if (!$id) {
    debugLog("IDが無効", $_GET);
    header('Location: index.html');
    exit;
}

// 結果ファイルの読み込み
$resultsFile = __DIR__ . "/results/{$id}.json";
debugLog("結果ファイルパス", $resultsFile);

if (!file_exists($resultsFile)) {
    debugLog("ファイルが存在しない", $resultsFile);
    header('Location: index.html');
    exit;
}

$data = json_decode(file_get_contents($resultsFile), true);
$url = $data['url'];
$results = $data['results'];

// 星評価を生成する関数
function generateStars($score)
{
    $stars = '';
    for ($i = 1; $i <= 5; $i++) {
        $stars .= $i <= $score ? '★' : '☆';
    }
    return $stars;
}

// 評価コメントを生成する関数を追加
function generateComment($score, $type)
{
    $comments = [
        'seo' => [
            1 => '基本的なSEO対策が必要です。メタタグの設定から始めましょう。',
            2 => 'SEO対策の基礎はできています。さらなる改善の余地があります。',
            3 => '標準的なSEO対策ができています。構造化データの追加を検討しましょう。',
            4 => '優れたSEO対策が実施されています。さらなる最適化で上位表示を目指せます。',
            5 => '非常に優れたSEO対策が実施されています。定期的な監視と維持を続けましょう。'
        ],
        'content' => [
            1 => '基本的なコンテンツの充実が必要です。情報量を増やしましょう。',
            2 => 'コンテンツの基礎はできています。より詳細な情報の追加を検討しましょう。',
            3 => '標準的なコンテンツ量があります。更新頻度を上げることで改善が期待できます。',
            4 => '充実したコンテンツが提供されています。さらなるコンテンツの拡充を検討しましょう。',
            5 => '非常に充実したコンテンツ構成です。この質の高さを維持していきましょう。'
        ],
        'design' => [
            1 => '基本的なデザイン改善が必要です。レスポンシブ対応を検討しましょう。',
            2 => 'デザインの基礎はできています。ユーザビリティの向上が課題です。',
            3 => '標準的なデザインが実装されています。アクセシビリティの改善を検討しましょう。',
            4 => '優れたデザインが実装されています。さらなるUX向上を目指せます。',
            5 => '非常に優れたデザインです。最新のトレンドを取り入れ続けましょう。'
        ]
    ];

    return $comments[$type][$score] ?? 'データがありません';
}
?>
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>分析結果 - URLスカウター</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .result-container {
            background: white;
            padding: 2rem;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
        }

        .analyzed-url {
            word-break: break-all;
            padding: 1rem;
            background: #f5f6fa;
            border-radius: var(--border-radius);
            margin-bottom: 2rem;
        }

        .score-item {
            margin-bottom: 1.5rem;
            padding: 1rem;
            border: 1px solid #eee;
            border-radius: var(--border-radius);
        }

        .stars {
            font-size: 1.5rem;
            color: #ffd700;
            margin: 0.5rem 0;
        }

        .back-button {
            display: inline-block;
            margin-top: 1rem;
            text-decoration: none;
            color: var(--primary-color);
        }
    </style>
</head>

<body>
    <div class="container">
        <header>
            <h1>分析結果</h1>
        </header>

        <main>
            <div class="result-container">
                <h2>分析対象URL</h2>
                <div class="analyzed-url">
                    <a href="<?php echo htmlspecialchars($url); ?>" target="_blank">
                        <?php echo htmlspecialchars($url); ?>
                    </a>
                </div>

                <div class="score-item">
                    <h3>集客（SEO）評価</h3>
                    <div class="stars"><?php echo generateStars($results['seo']); ?></div>
                    <p><?php echo generateComment($results['seo'], 'seo'); ?></p>
                </div>

                <div class="score-item">
                    <h3>コンテンツ評価</h3>
                    <div class="stars"><?php echo generateStars($results['content']); ?></div>
                    <p><?php echo generateComment($results['content'], 'content'); ?></p>
                </div>

                <div class="score-item">
                    <h3>デザイン評価</h3>
                    <div class="stars"><?php echo generateStars($results['design']); ?></div>
                    <p><?php echo generateComment($results['design'], 'design'); ?></p>
                </div>

                <a href="index.html" class="back-button">← トップページに戻る</a>
            </div>
        </main>
    </div>
</body>

</html>