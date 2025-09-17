<?php
/**
 * Webhook Handler for GitHub Auto-Commit
 *
 * This PHP script receives updates from the admin panel
 * and triggers GitHub commits automatically.
 *
 * IMPORTANT: This is a simplified example for demonstration.
 * In production, you would need proper authentication and validation.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
$required_fields = ['projects', 'settings', 'timestamp'];
foreach ($required_fields as $field) {
    if (!isset($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

try {
    // Save projects.json
    $projects_json = json_encode($data['projects'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    file_put_contents(__DIR__ . '/new/data/projects.json', $projects_json);

    // Save settings.json
    $settings_json = json_encode($data['settings'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    file_put_contents(__DIR__ . '/new/data/settings.json', $settings_json);

    // Trigger git commit
    $commit_message = "🎨 Portfolio uppdaterat via admin-panel

Ändringar gjorda: " . date('Y-m-d H:i:s') . "

🤖 Auto-commited via webhook";

    $commands = [
        'cd ' . __DIR__,
        'git add new/data/projects.json new/data/settings.json',
        'git commit -m ' . escapeshellarg($commit_message),
        'git push origin main'
    ];

    $output = [];
    $return_code = 0;

    foreach ($commands as $command) {
        exec($command . ' 2>&1', $output, $return_code);
        if ($return_code !== 0) {
            throw new Exception("Git command failed: $command");
        }
    }

    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Changes committed and pushed successfully',
        'timestamp' => date('c'),
        'files_updated' => ['projects.json', 'settings.json']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error: ' . $e->getMessage(),
        'timestamp' => date('c')
    ]);
}
?>