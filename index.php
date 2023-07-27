<?php
function listFoldersWithMessage($directory) {
    $folders = scandir($directory);

    $data = [];

    foreach ($folders as $folder) {
        if ($folder !== '.' && $folder !== '..' && is_dir($directory . '/' . $folder)) {
            $messageFile = $directory . '/' . $folder . '/commit_message';

            $message = file_exists($messageFile) ? file_get_contents($messageFile) : '';

            $data[] = [$folder, $message];

        }
    }
    return $data;
}

$directory = '.';
$data = listFoldersWithMessage($directory);
$data = array_reverse($data);
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bridge Presentations</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
        }
        
        h1 {
            margin-top: 20px;
        }
        
        ul {
            list-style-type: none;
            padding: 0;
            margin: 20px auto;
            max-width: 400px;
        }
        
        li {
            margin-bottom: 10px;
            border: 1px solid #ccc;
            padding: 10px;
            background-color: #f7f7f7;  

        }

        li div {
            font-weight: bold;
        }

        
        a {
            text-decoration: none;
            color: #333;
        }
        
        p {
            margin: 0;
            margin-top: 5px;
            font-size: 14px;
            color: #666;
        }

        a:not(:first-child) li div{
            color: #666;
            text-decoration: line-through;
        }

        
        a:hover li {
            background-color: #e7e7e7;
        }
    </style>
</head>
<body>
    <h1>Bridge presentations</h1>    
    <ul>
        <?php foreach ($data as $row): ?>
            <a href="<?php echo $row[0]; ?>">
            <li>
                <div>version <?php echo $row[0]; ?></div>
                <p><?php echo $row[1]; ?></p>
            </li>
            </a>
        <?php endforeach; ?>
</body>
</html>