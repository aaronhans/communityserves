<script>
	import Map from './Map.svelte';
	import Requests from './Requests.svelte'
	import Modal from './Modal.svelte'

	let showRequestTypeModal = false;
	let showAboutModal = false;
</script>

<main>
	<Map />
	<Requests />
</main>

{#if showRequestTypeModal}
<Modal on:close="{() => showRequestTypeModal = false}">
	<a class="request-cleanup-cta" href="https://forms.gle/489s69zb24GaNyfK6" target="_blank"><i class="icon-earthquake-fill"></i>Clean Up</a>
	<hr/>
	<a class="request-art-cta" href="https://forms.gle/VKyexQDKkciK2At59" target="_blank"><i class="icon-paint-brush-fill"></i>Art Install</a>
</Modal>
{/if}

{#if showAboutModal}
<Modal on:close="{() => showAboutModal = false}">
	<h2>About CommunityServe</h2>
	<p>CommunityServe was built by Neighbors in the Oakland area in solidarity with #BLM and the George Floyd protests.</p>
	<p><strong>There is work to be done. <a href="https://forms.gle/H3UJcCATeU4CU85y5" target="_blank">Join Us</a></strong>.</p>
	<p>Get Involved<br>
	<a href="https://forms.gle/guyxLC6d2G9SBkzM9" target="_blank">Artist Sign Up</a>
	</p>
</Modal>
{/if}

<footer>
	<a class="request-help-cta" on:click="{() => showRequestTypeModal = true}"><h1>Request Community Help</h1></a>
	<div class="footer-content">
		<div>A community funded project to support historically <a href="https://www.npr.org/2017/05/03/526655831/a-forgotten-history-of-how-the-u-s-government-segregated-america" target="_blank">red-lined</a> black & brown cities in direct action through service &amp; art.</div>
		<div class="footer-links"><a class="about-link" on:click="{() => showAboutModal = true}">About</a></div>
	</div>
</footer>

<style type="text/scss">
	.request-cleanup-cta {
		color: #6209F2;
		text-decoration: none;
		
		i {
			margin-left: 0;
		}
	}

	.request-art-cta {
		color: #9C08B5;
		text-decoration: none;

		i {
			margin-left: 0;
		}
	}

</style>