<?php
	require('php/libs/BukBuilder.class.php');
	BukBuilder::init();
?>
<html>
<head>
	<title>Buk Builder Example</title>

	<?php echo BukBuilder::style('style.css'); ?>
	<?php echo BukBuilder::script('modernizr.js'); ?>
</head>
<body>
	<p>Sed posuere consectetur est at lobortis. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Etiam porta sem malesuada magna mollis euismod. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>

	<p>Nullam id dolor id nibh ultricies vehicula ut id elit. Etiam porta sem malesuada magna mollis euismod. Maecenas sed diam eget risus varius blandit sit amet non magna. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>

	<?php echo BukBuilder::script('app.js', 'jquery.js'); ?>
	
</body>
</html>
