<svg
	width="100%"
	height="120"
	xmlns="http://www.w3.org/2000/svg"
	class="footer__wave"
>
	<!--
		No viewBox — the SVG coordinate space IS screen pixels.
		patternUnits="userSpaceOnUse" tiles the 120px pattern cell in screen pixels,
		filling width="100%" edge to edge at a consistent tree size on every viewport.
	-->
	<defs>
		<pattern
			id="pine-pattern"
			x="0"
			y="0"
			width="120"
			height="120"
			patternUnits="userSpaceOnUse"
		>
			<g transform="translate(60, 103)">
				<!-- Trunk -->
				<rect x="-3" y="-20" width="6" height="20" fill="var(--color--text)" opacity="0.4" />
				<!-- Top tier -->
				<polygon points="0,-85  -14,-55  14,-55" fill="var(--color--primary)" opacity="0.9" />
				<!-- Mid tier -->
				<polygon points="0,-65  -19,-36  19,-36" fill="var(--color--primary)" opacity="0.75" />
				<!-- Bottom tier -->
				<polygon points="0,-45  -25,-18  25,-18" fill="var(--color--primary)" opacity="0.6" />
			</g>
		</pattern>

		<linearGradient id="ground-grad" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%"   stop-color="var(--color--primary)" stop-opacity="0.08" />
			<stop offset="100%" stop-color="var(--color--primary)" stop-opacity="0.03" />
		</linearGradient>
	</defs>


	<!-- Trees -->
	<rect width="100%" height="100" fill="url(#pine-pattern)" />
</svg>

<style>
	.footer__wave {
		display: block;
		width: 100%;
		overflow: visible;
	}
</style>
