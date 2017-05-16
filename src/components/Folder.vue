<template>
    <div class="mdl-card mdl-shadow--2dp">
        <p v-if="error" class="error">An error occurred loading data: {{error}}</p>
        <div class="refresh">
            <button class="mdl-button mdl-js-button mdl-button--icon" v-show="!loading" @click="load">
                <i class="material-icons">refresh</i>
            </button>
            <div class="mdl-spinner mdl-js-spinner is-active" v-show="loading"></div>
        </div>
        <ul class="mdl-list">
            <li class="mdl-list__item mdl-list__item--two-line" v-for="item in contents" @click="open(item)">
                <span class="mdl-list__item-primary-content">
                    <i class="material-icons mdl-list__item-icon">{{item.file ? 'content_paste' : 'folder'}}</i>
                    <span>{{item.name}}</span>
                    <span class="mdl-list__item-sub-title"
                          v-if="item.file">{{formatSize(item.size)}} - Modified: {{formatTime(item.modified)}}</span>
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
  import api from '../api';

  export default {
    name: 'Folder',
    data: () => ({
      contents: [],
      loading: false,
      error: null,
    }),
    mounted() {
      this.load();
    },
    methods: {
      load() {
        this.loading = true;
        api.get('folder')
          .then((contents) => {
            console.log(contents);
            this.contents = contents.sort((a, b) => {
              if (a.file !== b.file) {
                return a.file ? -1 : 1;
              }
              return a.name.localeCompare(b.name);
            });
            this.loading = false;
          })
          .catch((err) => {
            this.error = err.message;
            this.loading = false;
          });
      },
      open(item) {
        if (!item.file) {
          alert('Accessing folders is not yet supported');
        } else {
          this.$emit('open', item.name);
        }
      },
      formatSize(size) {
        if (size < 1024) {
          return `${size} bytes`;
        } else if (size < 1024 * 1024) {
          return `${Math.round(size / 1024)} KB`;
        } else if (size < 1024 * 1024 * 1024) {
          return `${Math.round(size / 1024 / 1024)} MB`;
        }
        return `${Math.round(size / 1024 / 1024 / 1024)} GB`;
      },
      formatTime(time) {
        const now = Date.now();
        if (now - time > 24 * 60 * 60 * 1000) {
          return new Date(time).toLocaleDateString();
        }
        return new Date(time).toLocaleTimeString();
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
    .mdl-card {
        width: 100%;
    }

    .error {
        text-align: center;
        color: red;
        padding: 24px;
        font-style: italic;
    }

    .refresh {
        text-align: center;
        margin-top: 16px;
    }

    .mdl-list__item:hover {
        background-color: rgba(0, 0, 0, 0.11);
        cursor: pointer;
    }
</style>
