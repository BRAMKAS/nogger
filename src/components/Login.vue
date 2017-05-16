<template>
    <div class="mdl-card mdl-shadow--2dp login">
        <header class="mdl-layout__header">
            <div class="mdl-layout__header-row">
                <img :src="logo" class="logo">
                <!-- Title -->
                <span class="mdl-layout-title">Login</span>
            </div>
        </header>
        <form action="#" @submit.prevent="submit()">
            <p v-if="error">{{error}}</p>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input" type="text" id="username" v-model="username">
                <label class="mdl-textfield__label" for="username">Username</label>
            </div>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input" type="password" id="password" v-model="password">
                <label class="mdl-textfield__label" for="password">Password</label>
            </div>
            <button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">
                Login
            </button>
        </form>
    </div>
</template>

<script>
  import api from '../api';
  import logo from '../../assets/logo.png';

  export default {
    name: 'Refresher',
    props: {
      refreshing: Boolean,
    },
    data: () => ({
      logo,
      username: '',
      password: '',
      error: null,
    }),
    methods: {
      submit() {
        api.post('login', {
          username: this.username,
          password: this.password,
        })
          .then((re) => {
            console.log('SUCCESS', re);
            if (re.success) {
              this.$emit('success');
            }
            this.error = re.errorText;
          })
          .catch((err) => {
            this.error = err.message;
          });
      },
    },
  };
</script>

<style>
    .refresh .mdl-spinner > div {
        border-color: white !important;
    }
</style>

<style scoped>
    .login {
        margin: 16px auto;
    }

    .logo {
        margin-left: -56px;
        margin-right: 16px;
    }

    form {
        padding: 16px;
    }
</style>
