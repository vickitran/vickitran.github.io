<section id="hero">
	<h1 class="hello">Servus!</h1>
</section>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	#hero {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 18px;
		position: relative;
		padding: 88px 0 64px;

		@include for-phone-only {
			padding: 48px 0 40px;
		}

		.hello {
			text-align: center;
			font-family: var(--font--title);
			font-size: 3.6rem;
			font-weight: 400;           // Georgia displays beautifully at 400
			letter-spacing: -0.03em;
			color: var(--color--text);
			line-height: 1;

			@include for-phone-only {
				font-size: 2.6rem;
			}
		}

		.intro {
			font-weight: 400;
			font-size: 1.15rem;
			width: min(100%, 440px);
			display: flex;
			flex-direction: column;
			color: var(--color--text-shade);
			line-height: 1.6;

			.left  { text-align: left; }
			.right { text-align: right; }

			@include for-phone-only {
				display: none;
			}
		}

		.ctas {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
			gap: 10px;
			width: 100%;
		}
	}
</style>
