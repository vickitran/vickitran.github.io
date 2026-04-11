<script>
	import FooterWave from '$lib/icons/footer-wave.svelte';
	import Socials from '$lib/components/molecules/Socials.svelte';
	import ThemeToggle from '$lib/components/molecules/ThemeToggle.svelte';
	import RssLink from '$lib/components/atoms/RssLink.svelte';
</script>

<footer>
	<div class="wave">
		<FooterWave />
	</div>
	<div class="content">
		<div class="copyright">Modified with 💚 by Victoria Labmayr</div>
	</div>
</footer>

<style lang="scss">
	footer {
		height: 300px;
		width: 100%;
		display: grid;
		grid-template-rows: 100px 1fr;

		.content {
			background: linear-gradient(
				150deg,
				var(--color--waves-start) 0%,
				var(--color--waves-end) 100%
			);
			border-top: 1px solid rgba(var(--color--primary-rgb), 0.15);

			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			font-weight: 500;
			font-size: 0.85rem;
			text-align: center;
			color: var(--color--text-shade);
			letter-spacing: 0.02em;
		}

		a {
			color: var(--color--text);
			text-decoration: none;
			&:hover {
				color: var(--color--primary);
			}
		}
	}
</style>
