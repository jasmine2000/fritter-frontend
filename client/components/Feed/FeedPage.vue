<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2>Welcome @{{ $store.state.username }}</h2>
      </header>
      <CreateFreetForm />
    </section>
    <section v-else>
      <header>
        <h2>Welcome to Fritter!</h2>
      </header>
      <article>
        <h3>
          <router-link to="/login">
            Sign in
          </router-link>
          to create, edit, and delete freets.
        </h3>
      </article>
    </section>
    <section v-if="$store.state.username">
      <header>
        <div class="left">
          <h2>
            Your Feed
          </h2>
        </div>
      </header>
      <section
        v-if="freets.length"
      >
        <FreetComponent
          v-for="freet in freets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No freets found.</h3>
      </article>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, CreateFreetForm},
  data() {
    return {
      freets: []
    }
  },
  mounted() {
    this.getFreets();
  },
  methods: {
    async getFreets() {
      if (this.$store.state.username == undefined) return;
      const url = `/api/freets?username=${this.$store.state.username}&following=true`;
      try {
        const r = await fetch(url);
        const res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.freets = res;
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
