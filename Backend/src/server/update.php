<?php
include("functions.php");
//--------Database----------

session_start();
if (!isset($_SESSION['user'])) {
  header('location:login.php');

  exit();
}
function updateProject($projectName, $htmlContent, $cssContent)
{
  // Create the project folder
  $userId = "user" . getUserID($_SESSION['user']['email']);

  $projectFolderPath = "users/" . $userId . "/projects/"; // Assuming 'projects' is the folder where all projects are stored


  // Create the specific project folder inside the 'projects' folder
  $projectFolder = $projectFolderPath . "/$projectName";


  // Store HTML file
  file_put_contents("$projectFolder/index.html", $htmlContent);

  // Create CSS folder and files
  $cssFolderPath = $projectFolder . "/css";
  file_put_contents("$cssFolderPath/style.css", $cssContent); // User's CSS file



}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $projectName = $_POST["project_name"];

  // Check if a file was uploaded
  if (isset($_FILES['json_file']) && $_FILES['json_file']['error'] == 0) {
    $jsonFile = $_FILES['json_file']['tmp_name'];
    $jsonContents = file_get_contents($jsonFile);
    $data = json_decode($jsonContents, true);

    // Check if HTML and CSS content keys exist
    if (isset($data["html"]) && isset($data["css"])) {
      $htmlContent = $data["html"];
      $cssContent = $data["css"];

      updateProject($projectName, $htmlContent, $cssContent);

      echo "Project '$projectName' HTML, CSS updated successfully.";
    } else {
      echo "Error: HTML content and CSS content are required in the JSON file.";
    }
  } else {
    echo "Error: No JSON file uploaded.";
  }
}
?>


<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update Project</title>
</head>

<body>
  <h2>update an existing Project</h2>
  <form method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>" enctype="multipart/form-data">
    <label for="project_name">Project Name:</label><br>
    <input type="text" id="project_name" name="project_name"><br><br>

    <label for="json_file">Upload JSON File:</label><br>
    <input type="file" name="json_file" id="json_file"><br><br>

    <input type="submit" value="Update Project">
  </form>
  <br>
  <br>
  <a href="viewProjects.php">back</a><br><br><br>
</body>

</html>