<template>
    <div>
        <!-- Always shows a header, even in smaller screens. -->
        <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header" v-show="auth">
            <header class="mdl-layout__header">
                <div class="mdl-layout__header-row">
                    <img :src="logo" class="logo" @click="unselect()">
                    <!-- Title -->
                    <span class="mdl-layout-title">{{!selected ? 'Select file' : selected}}</span>
                    <!-- Add spacer, to align navigation to the right -->
                    <div class="mdl-layout-spacer"></div>
                    <!-- Navigation. We hide it in small screens. -->
                    <Refresher @refresh="refresh" :refreshing="folder.loading || file.loading"></Refresher>
                    <button class="android-more-button mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect"
                            id="more-button">
                        <i class="material-icons">more_vert</i>
                    </button>
                    <ul class="mdl-menu mdl-js-menu mdl-menu--bottom-right mdl-js-ripple-effect" for="more-button">
                        <li class="mdl-menu__item" @click="contribute()">Contribute</li>
                        <li class="mdl-menu__item" @click="logout()">Logout</li>
                    </ul>
                </div>
            </header>
            <main class="mdl-layout__content">
                <div class="page-content">
                    <file-viewer v-show="selected"
                                 ref="file"
                                 :contents="file.contents"
                                 :on-filter="applyFilter"></file-viewer>
                    <folder-viewer v-show="!selected"
                                   ref="folder"
                                   :contents="folder.contents"
                                   @select="select"></folder-viewer>
                </div>
            </main>
        </div>

        <login v-show="auth === false" @success="authSuccess()"></login>

        <div class="mdl-js-snackbar mdl-snackbar" ref="snackbar">
            <div class="mdl-snackbar__text"></div>
            <button class="mdl-snackbar__action" type="button"></button>
        </div>
    </div>
</template>

<script>
  import 'material-design-lite';
  import FolderViewer from './components/FolderViewer.vue';
  import FileViewer from './components/FileViewer.vue';
  import Refresher from './components/Refresher.vue';
  import Login from './components/Login.vue';
  import api from './api';
  import logo from '../assets/logo.png';

  export default {
    name: 'App',
    components: {
      FileViewer,
      FolderViewer,
      Refresher,
      Login,
    },
    data: () => ({
      selected: null,
      auth: null,
      file: {
        contents: [],
        filter: {},
        total: null,
        loading: false,
        error: null,
      },
      folder: {
        contents: [],
        loading: false,
        error: null,
      },
      logo,
    }),
    mounted() {
      componentHandler.upgradeElements(this.$el);
      api.get('check-auth')
        .then((re) => {
          this.auth = re.auth;
          if (re.auth) {
            this.loadFolder();
          }
        })
        .catch(() => (this.auth = false));
    },
    methods: {
      authSuccess() {
        this.auth = true;
        this.loadFolder();
      },
      refresh() {
        if (this.selected) {
          this.loadFile();
        } else {
          this.loadFolder();
        }
      },
      select(file) {
        this.selected = file;
        this.loadFile();
      },
      unselect() {
        this.selected = null;
      },
      applyFilter(filter) {
        this.file.filter = filter;
        this.loadFile();
      },
      loadFile() {
        this.file.loading = true;
        let params = '';
        Object.keys(this.file.filter).forEach((key) => {
          if (params) {
            params += '&';
          }
          params += `${encodeURIComponent(key)}=${encodeURIComponent(this.file.filter[key])}`;
        });
        api.get(`file/${encodeURIComponent(this.selected)}?${params}`)
          .then((re) => {
            this.file.contents = re.contents;
            this.file.total = re.total;
            this.file.loading = false;
          })
          .catch((err) => {
            this.file.error = err.message;
            this.file.loading = false;
            this.$refs.snackbar.MaterialSnackbar.showSnackbar({
              message: err.message,
              timeout: 2000,
            });
          });
      },
      loadFolder() {
        this.folder.loading = true;
        api.get('folder')
          .then((contents) => {
            this.folder.contents = contents.sort((a, b) => {
              if (a.file !== b.file) {
                return a.file ? -1 : 1;
              }
              return a.name.localeCompare(b.name);
            });
            this.folder.loading = false;
          })
          .catch((err) => {
            this.folder.error = err.message;
            this.folder.loading = false;
            this.$refs.snackbar.MaterialSnackbar.showSnackbar({
              message: err.message,
              timeout: 2000,
            });
          });
      },
      contribute() {
        window.open('https://github.com/paul-em/nogger', '_blank');
      },
      logout() {
        api.post('logout')
          .then(() => {
            this.auth = false;
          })
          .catch((err) => {
            this.$refs.snackbar.MaterialSnackbar.showSnackbar({
              message: err.message,
              timeout: 2000,
            });
          });
      },
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

    .logo {
        margin-left: -56px;
        margin-right: 10px;
        cursor: pointer;
    }

    .mdl-layout-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
    }
</style>
