<template>
    <div class="refresh">
        <button class="mdl-button mdl-js-button mdl-button--icon" v-show="!refreshing" @click="$emit('refresh')">
            <i class="material-icons">refresh</i>
        </button>
        <div class="mdl-spinner mdl-js-spinner mdl-spinner--single-color is-active" v-show="refreshing"></div>
    </div>
</template>

<script>
  export default {
    name: 'Refresher',
    props: {
      refreshing: Boolean,
    },
  };
</script>

<style>
    .refresh .mdl-spinner > div {
        border-color: white !important;
    }
</style>

<style scoped>
    .refresh {
        text-align: center;
    }
</style>
