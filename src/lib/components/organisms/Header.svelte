<script lang="ts">
	import Logo from '$lib/components/atoms/Logo.svelte';
	import ThemeToggle from '$lib/components/molecules/ThemeToggle.svelte';
	import RssLink from '$lib/components/atoms/RssLink.svelte';

	export let showBackground = false;
</script>

<header class:has-background={showBackground}>
	<nav class="container">
		<!-- <a class="logo" href="/" aria-label="Site logo">
			<Logo />
		</a> -->
		<div class="links">
			<a href="/blog">Blog</a>
			<!-- <RssLink /> -->
			<ThemeToggle />
		</div>
	</nav>
</header>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	header {
		position: relative;
		padding: 24px 0;
		border-bottom: 1px solid transparent;
		transition: border-color 0.3s ease, background 0.3s ease;

		@include for-phone-only {
			padding: 16px 0;
		}

		&.has-background {
			background: rgba(var(--color--page-background-rgb, 244, 242, 235), 0.88);
			backdrop-filter: blur(10px);
			border-bottom-color: rgba(var(--color--primary-rgb), 0.15);
		}

		.container {
			display: flex;
			align-items: center;
			gap: 30px;

			@include for-phone-only {
				.links a {
					display: none;
				}
			}
		}

		.logo {
			height: 44px;
			flex: 1;
		}

		a {
			color: var(--color--text);
		}

		.links {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			gap: 28px;
			margin-left: auto;

			a {
				font-size: 0.8rem;
				font-weight: 500;
				letter-spacing: 0.07em;
				text-transform: uppercase;
				text-decoration: none;
				color: var(--color--text-shade);
				transition: color 0.2s ease;

				&:hover {
					color: var(--color--primary);
					text-underline-offset: unset;
				}
			}
		}
	}
</style>
