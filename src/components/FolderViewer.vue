<template>
    <div class="mdl-card mdl-shadow--2dp">
        <ul class="mdl-list">
            <li class="mdl-list__item mdl-list__item--two-line" v-for="item in contents" @click="select(item)">
                <span class="mdl-list__item-primary-content">
                    <i class="material-icons mdl-list__item-icon">{{item.file ? 'content_paste' : 'folder'}}</i>
                    <span>{{item.name}}</span>
                    <span class="mdl-list__item-sub-title"
                          v-if="item.file">{{formatSize(item.size)}} - Modified: {{formatTime(item.modified)}}</span>
                </span>
            </li>
        </ul>

        <div class="mdl-js-snackbar mdl-snackbar" ref="snackbar">
            <div class="mdl-snackbar__text"></div>
            <button class="mdl-snackbar__action" type="button"></button>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'FolderViewer',
    props: {
      contents: { type: Array, required: true },
    },
    methods: {
      select(item) {
        if (!item.file) {
          this.$refs.snackbar.MaterialSnackbar.showSnackbar({
            message: 'Accessing folders is not yet supported',
            timeout: 2000,
          });
        } else {
          this.$emit('select', item.name);
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

    .mdl-list__item:hover {
        background-color: rgba(0, 0, 0, 0.11);
        cursor: pointer;
    }
</style>
