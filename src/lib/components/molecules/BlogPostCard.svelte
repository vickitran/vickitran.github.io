<script lang="ts">
	import Card from '$lib/components/atoms/Card.svelte';
	import Tag from '$lib/components/atoms/Tag.svelte';
	import Image from '../atoms/Image.svelte';

	export let title: string;
	export let coverImage: string | undefined = undefined;
	export let excerpt: string;
	export let slug: string;
	export let tags: string[] | undefined;
	export let readingTime: string | undefined = undefined;

	export let showImage = true;
</script>

<Card
	href="/{slug}"
	target="_self"
	additionalClass="blog-post-card {!showImage || !coverImage ? 'no-image' : ''}"
>
	<div class="image" slot="image">
		{#if coverImage}
			<Image src={coverImage} alt="Cover image of this blog post" />
		{/if}
	</div>
	<div class="content" slot="content">
		<p class="title">{title}</p>
		{#if readingTime}
			<div class="note">{readingTime}</div>
		{/if}
		{#if excerpt}
			<p class="text">{excerpt}</p>
		{/if}
	</div>
	<div class="footer" slot="footer">
		{#if tags?.length}
			<div class="tags">
				{#each tags.slice(0, 2) as tag}
					<Tag>{tag}</Tag>
				{/each}
			</div>
		{/if}
	</div>
</Card>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: flex-start;
	}

	.title {
		font-family: var(--font--title);   // Georgia — editorial
		font-size: 1.15rem;
		font-weight: 400;
		line-height: 1.3;
		letter-spacing: -0.01em;
		color: var(--color--text);
		width: 100%;
	}

	.note {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color--text-shade);
		margin-top: 4px;
	}

	.text {
		margin-top: 8px;
		font-size: 0.875rem;
		line-height: 1.65;
		color: var(--color--text-shade);
		/* clamp to 3 lines so cards stay uniform even with long excerpts */
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.footer {
		margin-top: 16px;
	}

	.tags {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	/* Force every card to be horizontal like the featured first card */
	:global(.blog-post-card) {
		flex-direction: row;
		height: 180px;
	}

	:global(.blog-post-card > .body) {
		flex: 1;
		overflow: hidden;
		justify-content: center;
	}

	:global(.blog-post-card .image) {
		flex: 0 0 260px;
		min-height: unset;
		max-height: unset;
	}

	:global(.blog-post-card .image img) {
		width: 100%;
		height: 100%;
		border-radius: 0;
		object-fit: cover;
	}

	:global(.blog-post-card.no-image) {
		/* no image — text fills full width, left border accent instead */
		border-left: 4px solid var(--color--primary);
	}

	:global(.blog-post-card.no-image > .image) {
		display: none;
	}
</style>
