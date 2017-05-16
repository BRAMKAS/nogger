<template>
    <div>
        <!-- Always shows a header, even in smaller screens. -->
        <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
            <header class="mdl-layout__header">
                <div class="mdl-layout__header-row">
                    <!-- Title -->
                    <span class="mdl-layout-title">Title</span>
                    <!-- Add spacer, to align navigation to the right -->
                    <div class="mdl-layout-spacer"></div>
                    <!-- Navigation. We hide it in small screens. -->
                    <nav class="mdl-navigation mdl-layout--large-screen-only">
                        <a class="mdl-navigation__link" href="">Link</a>
                        <a class="mdl-navigation__link" href="">Link</a>
                        <a class="mdl-navigation__link" href="">Link</a>
                        <a class="mdl-navigation__link" href="">Link</a>
                    </nav>
                </div>
            </header>
            <main class="mdl-layout__content">
                <div class="page-content">
                    <folder></folder>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
  import 'material-design-lite';
  import Folder from './components/Folder.vue';

  export default {
    name: 'App',
    components: {
      Folder,
    },
    mounted() {
      componentHandler.upgradeElements(this.$el);
    },
  };
</script>

<style>
    body, html {
        margin: 0;
        background-color: #F2F2F2;
    }
</style>

<style scoped>
    .page-content {
        max-width: 1200px;
        margin: 16px auto;
    }
</style>
