<script>
	import { fade } from 'svelte/transition';

	import { toast } from '@zerodevx/svelte-toast';
	import { newService } from '$store';
	import { page, session } from '$app/stores';
	import { request } from '$lib/request';
	import { goto } from '$app/navigation';
	import Loading from '$components/Loading.svelte';
	import TooltipInfo from '$components/TooltipInfo.svelte';
	import { browser } from '$app/env';

	$: deployable =
		$newService.baseURL === '' ||
		$newService.baseURL === null ||
		$newService.email === '' ||
		$newService.email === null ||
		$newService.userName === '' ||
		$newService.userName === null ||
		$newService.userPassword === '' ||
		$newService.userPassword === null ||
		$newService.userPassword.length <= 6 ||
		$newService.userPassword !== $newService.userPasswordAgain;
	let loading = false;
	async function deploy() {
		try {
			loading = true;
			const payload = $newService;
			delete payload.userPasswordAgain;
			await request(`/api/v1/services/deploy/${$page.params.type}`, $session, {
				body: payload
			});
			if (browser) {
				toast.push(
					'Service deployment queued.<br><br><br>It could take 2-5 minutes to be ready, be patient and grab a coffee/tea!',
					{ duration: 4000 }
				);
				goto(`/dashboard/services`, { replaceState: true });
			}
		} catch (error) {
			console.log(error);
			browser && toast.push('Oops something went wrong. See console.log.');
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-full text-white">
	<div class="py-5 text-left px-6 text-3xl tracking-tight font-bold">
		Deploy new
		{#if $page.params.type === 'plausible'}
			<span class="text-blue-500 px-2 capitalize">Plausible Analytics</span>
		{/if}
	</div>
</div>
{#if loading}
	<Loading />
{:else}
	<div class="space-y-2 max-w-4xl mx-auto px-6 flex-col text-center" in:fade={{ duration: 100 }}>
		<div class="grid grid-flow-row">
			<label for="Domain"
				>Domain <TooltipInfo
					position="right"
					label={`You will have your Plausible instance at here.`}
				/></label
			>
			<input
				id="Domain"
				class:border-red-500={$newService.baseURL == null || $newService.baseURL == ''}
				bind:value={$newService.baseURL}
				placeholder="analytics.coollabs.io"
			/>
		</div>
		<div class="grid grid-flow-row">
			<label for="Email">Email</label>
			<input
				id="Email"
				class:border-red-500={$newService.email == null || $newService.email == ''}
				bind:value={$newService.email}
				placeholder="hi@coollabs.io"
			/>
		</div>
		<div class="grid grid-flow-row">
			<label for="Username">Username </label>
			<input
				id="Username"
				class:border-red-500={$newService.userName == null || $newService.userName == ''}
				bind:value={$newService.userName}
				placeholder="admin"
			/>
		</div>
		<div class="grid grid-flow-row">
			<label for="Password"
				>Password <TooltipInfo position="right" label={`Must be at least 7 characters.`} /></label
			>
			<input
				id="Password"
				type="password"
				class:border-red-500={$newService.userPassword == null ||
					$newService.userPassword == '' ||
					$newService.userPassword.length <= 6}
				bind:value={$newService.userPassword}
			/>
		</div>
		<div class="grid grid-flow-row pb-5">
			<label for="PasswordAgain">Password again </label>
			<input
				id="PasswordAgain"
				type="password"
				class:placeholder-red-500={$newService.userPassword !== $newService.userPasswordAgain}
				class:border-red-500={$newService.userPassword !== $newService.userPasswordAgain}
				bind:value={$newService.userPasswordAgain}
			/>
		</div>
		<button
			disabled={deployable}
			class:cursor-not-allowed={deployable}
			class:bg-blue-500={!deployable}
			class:hover:bg-blue-400={!deployable}
			class:hover:bg-transparent={deployable}
			class:text-warmGray-700={deployable}
			class:text-white={!deployable}
			class="button p-2"
			on:click={deploy}
		>
			Deploy
		</button>
	</div>
{/if}
