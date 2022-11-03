<!-- Profile page -->

<template>
  <section
    v-if="userFreets.length"
  >
    <FreetComponent
      v-for="freet in userFreets"
      :key="freet.id"
      :freet="freet"
    />
  </section>
  <article
    v-else
  >
    <h3>No freets found.</h3>
  </article>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';

export default {
  name: 'UserFreetsComponent',
  components: {FreetComponent},
  props: {
    username: {type: String, required: true}
  },
  data() {
    return {
      userFreets: [],
    };
  },
  mounted() {
    this.getFreets();
  },
  methods: {
    async getFreets() {
      /**
       * Gets given user's freets
       */
      try {
        const r = await fetch(`/api/freets/?username=${this.username}`);
        if (!r.ok) {
        throw new Error(res.error);
      }
            
      const res = await r.json();
      this.userFreets = res;

      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    },
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
