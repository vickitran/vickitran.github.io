<script lang="ts">
	export let color: 'primary' | 'secondary' = 'primary';
</script>

<div class="tag {color}">
	<slot />
</div>

<style lang="scss">
	.tag {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 3px 10px;
		border-radius: 2px;           // brand: 3px corner radius for bars
		font-weight: 500;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		width: fit-content;
		white-space: nowrap;
		text-transform: uppercase;

		&.primary {
			background-color: var(--color--primary-tint);
			color: var(--color--primary);
			border: 1px solid rgba(var(--color--primary-rgb), 0.2);
		}

		&.secondary {
			background-color: var(--color--secondary-tint);
			color: var(--color--secondary);
			border: 1px solid rgba(var(--color--secondary-rgb), 0.2);
		}
	}
</style>
