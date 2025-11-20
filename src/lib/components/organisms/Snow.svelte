<script lang="ts">
	export let snowflakeCount = 50;
</script>

<div class="snow-container">
	{#each Array(snowflakeCount) as _, i}
		<div
			class="snowflake"
			style="--delay: {Math.random() * 10}s; --duration: {10 +
				Math.random() * 10}s; --left: {Math.random() * 100}%; --size: {2 + Math.random() * 20}px;"
		>
			❄
		</div>
	{/each}
</div>

<style lang="scss">
	@import '$lib/scss/_breakpoints.scss';

	.snow-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: min(65vh, 500px);
		overflow: hidden;
		pointer-events: none;
		z-index: 10;

		@include for-phone-only {
			height: min(75vh, 400px);
		}
	}

	.snowflake {
		position: absolute;
		top: -10px;
		left: var(--left);
		font-size: var(--size);
		color: rgba(255, 255, 255, 0.8);
		user-select: none;
		pointer-events: none;

		@media screen and (prefers-reduced-motion: no-preference) {
			animation: fall var(--duration) linear var(--delay) infinite;
		}

		@media screen and (prefers-reduced-motion: reduce) {
			display: none;
		}
	}

	@keyframes fall {
		0% {
			transform: translateY(0) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			transform: translateY(calc(min(65vh, 500px) + 10px)) rotate(360deg);
			opacity: 0;
		}
	}

	@include for-phone-only {
		@keyframes fall {
			100% {
				transform: translateY(calc(min(75vh, 400px) + 10px)) rotate(360deg);
				opacity: 0;
			}
		}
	}
</style>
