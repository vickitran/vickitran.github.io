<script lang="ts">
	import BlogPostCard from '$lib/components/molecules/BlogPostCard.svelte';
	import ContentSection from '$lib/components/organisms/ContentSection.svelte';
	import type { BlogPost } from '$lib/utils/types';

	export let data: {
		posts: BlogPost[];
	};

	let { posts } = data;
</script>

<div class="container">
	<ContentSection title="All Blog Posts">
		<div class="grid">
			{#each posts as post}
				<BlogPostCard
					title={post.title}
					coverImage={post.coverImage}
					excerpt={post.excerpt}
					readingTime={post.readingTime}
					slug={post.slug}
					tags={post.tags}
				/>
			{/each}
		</div>
	</ContentSection>
</div>

<style lang="scss">
	@import '$lib/scss/_mixins.scss';

	.grid {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
