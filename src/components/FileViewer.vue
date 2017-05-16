<template>
    <div>
        <div class="mdl-card mdl-shadow--2dp contents">
            <ul class="mdl-list">
                <li class="mdl-list__item" v-for="(item, index) in contents" :class="{odd: index % 2 === 1}">
                <span class="mdl-list__item-primary-content">
                    <span>{{item}}</span>
                </span>
                </li>
            </ul>
        </div>

        <form class="mdl-card mdl-shadow--2dp mdl-color--primary search-bar"
              @submit.prevent="submit()">
            <button id="menu-top-left"
                    class="mdl-button mdl-js-button mdl-button--icon">
                <i class="material-icons">{{!filters.regex ? 'format_clear' : (filters.caseSensitive ? 'title' : 'text_fields')}}</i>
            </button>
            <ul class="mdl-menu mdl-menu--top-left mdl-js-menu mdl-js-ripple-effect"
                data-mdl-for="menu-top-left">
                <li class="mdl-menu__item" @click="filters.regex = false">
                    <span class="material-icons">format_clear</span>
                    Case Insensitive
                </li>
                <li class="mdl-menu__item" @click="filters.regex = true; filters.caseSensitive = false">
                    <span class="material-icons">text_fields</span>
                    RegEx + Case Insenitive
                </li>
                <li class="mdl-menu__item" @click="filters.regex = true; filters.caseSensitive = true">
                    <span class="material-icons">title</span>
                    RegEx + Case Sensitive
                </li>
            </ul>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label search-input">
                <input class="mdl-textfield__input"
                       type="text"
                       id="search"
                       v-model="filters.search">
                <label class="mdl-textfield__label" for="search">Search...</label>
            </div>


            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input"
                       type="text"
                       pattern="-?[0-9]*(\.[0-9]+)?"
                       id="limit"
                       v-model="filters.limit">
                <label class="mdl-textfield__label" for="limit">Limit</label>
            </div>

            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input"
                       type="text"
                       pattern="-?[0-9]*(\.[0-9]+)?"
                       id="skip"
                       v-model="filters.skip">
                <label class="mdl-textfield__label" for="skip">Skip</label>
            </div>

            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input"
                       type="text"
                       pattern="-?[0-9]*(\.[0-9]+)?"
                       id="before"
                       v-model="filters.before">
                <label class="mdl-textfield__label" for="before">Before</label>
            </div>

            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input"
                       type="text"
                       pattern="-?[0-9]*(\.[0-9]+)?"
                       id="after"
                       v-model="filters.after">
                <label class="mdl-textfield__label" for="after">After</label>
            </div>
            <button class="mdl-button mdl-js-button mdl-button--icon" type="submit" @click.prevent="submit()">
                <i class="material-icons">arrow_forward</i>
            </button>
        </form>
    </div>
</template>

<script>
  export default {
    name: 'FileViewer',
    props: {
      contents: { type: Array, required: true },
      total: Number,
      onFilter: { type: Function, required: true },
    },
    data: () => ({
      filters: {
        search: '',
        limit: 100,
        skip: 0,
        before: 0,
        after: 0,
        regex: false,
        caseSensitive: false,
      },
      $content: null,
    }),
    mounted() {
      this.$content = document.querySelector('.mdl-layout__content');
    },
    methods: {
      submit() {
        console.log('submit', this.filters);
        this.onFilter(this.filters);
      },
      scrollDown() {
        this.$content.scrollTop = this.$content.scrollHeight;
        this.$nextTick(() => {
          this.$content.scrollTop = this.$content.scrollHeight;
        });
      },
    },
    watch: {
      contents() {
        console.log('contents updated');
        this.scrollDown();
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
        min-height: 10px;
    }

    .contents {
        margin-bottom: 75px;
    }

    .search-bar {
        margin-top: 16px;
        color: white;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 0 16px;
        overflow: visible;
        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
    }

    .mdl-textfield {
        flex: 1;
        min-width: 70px;
    }

    .search-input {
        flex: 8;
        min-width: 200px;
    }

    .mdl-textfield__label {
        color: rgba(255, 255, 255, 0.8);
    }

    .mdl-textfield--floating-label.is-focused .mdl-textfield__label,
    .mdl-textfield--floating-label.is-dirty .mdl-textfield__label {
        color: white;
    }

    .mdl-textfield__label:after {
        background-color: white;
    }

    #menu-top-left {
        margin-top: 16px;
        margin-right: 6px;
    }

    button[type=submit] {
        margin-top: 16px;
    }

    .odd {
        background-color: rgba(0, 0, 0, 0.05);
    }
</style>
