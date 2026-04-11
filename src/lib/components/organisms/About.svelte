<script>
	import SparklingHighlight from '$lib/components/molecules/SparklingHighlight.svelte';
	import Socials from '$lib/components/molecules/Socials.svelte';
	import Image from '../atoms/Image.svelte';
</script>

<section id="about">
	<div class="info">
		<h2>
			I'm
			<SparklingHighlight color="secondary">Victoria Labmayr</SparklingHighlight>.
		</h2>
		<p>I work with data and knit. Both involve loops. Toronto raised. Salzburg based.</p>
		<div class="socials">
			<span>Socials:</span>
			<Socials />
		</div>
	</div>
	<div class="image">
		<Image src="/images/me.png" alt="Me Knitting" />
	</div>
</section>

<style lang="scss">
	@import '$lib/scss/breakpoints.scss';

	#about {
		position: relative;
		display: grid;
		grid-template-columns: 500px 250px;
		align-items: center;
		justify-content: center;
		gap: 48px;
		padding-bottom: 56px;

		@include for-phone-only {
			grid-template-columns: 1fr;
			justify-items: center;
			gap: 28px;
		}

		.info {
			display: flex;
			flex-direction: column;
			gap: 14px;

			h2 {
				font-family: var(--font--title);
				font-weight: 400;
				font-size: 1.75rem;
				letter-spacing: -0.015em;
				line-height: 1.2;

				@include for-phone-only {
					text-align: center;
				}
			}

			p {
				font-size: 1rem;
				line-height: 1.7;
				color: var(--color--text-shade);

				@include for-phone-only {
					text-align: center;
				}
			}

			@include for-phone-only {
				gap: 20px;
			}
		}

		.socials {
			display: flex;
			align-items: center;
			gap: 14px;
			margin-top: 4px;

			span {
				font-size: 0.8rem;
				font-weight: 500;
				letter-spacing: 0.07em;
				text-transform: uppercase;
				color: var(--color--text-shade);
			}

			@include for-phone-only {
				justify-content: center;
				margin-bottom: 10px;
				span { display: none; }
			}
		}

		.image {
			width: 260px;
			height: 260px;
			border-radius: 4px;
			overflow: hidden;
			box-shadow: var(--image-shadow);

			@include for-phone-only {
				width: 200px;
				height: 200px;
			}
		}
	}
</style>
