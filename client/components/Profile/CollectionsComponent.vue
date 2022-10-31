<!-- Default page that also displays freets -->

<template>
  <section>
    <span>
      <button
        v-for="collection in userCollections"
        :key="collection._id.toString()"
        :class="collection._id == currentCollection ? 'selected' : ''"
        @click="getCollectionFreets(collection._id.toString())"
      >
        {{ collection.title }}
      </button>
    </span>
    <AddCollectionForm
      ref="addCollectionForm"
      value=""
      placeholder="Enter Collection Name"
      button="Add Collection"
      @refresh="getCollections"
    />
    <section
      v-if="currentCollectionFreets.length"
    >
      <FreetComponent
        v-for="freet in currentCollectionFreets"
        :key="freet.id"
        :freet="freet"
      />
    </section>
    <article
      v-else
    >
      <h3>No freets in Collection.</h3>
    </article>
  </section>
</template>
  
<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import AddCollectionForm from '@/components/Profile/AddCollectionForm.vue';

export default {
name: 'CollectionsComponent',
components: {FreetComponent, AddCollectionForm},
data() {
    return {
    username: this.$route.params.username,
    userCollections: [],
    currentCollection: 0,
    currentCollectionFreets: []
    };
},
mounted() {
  this.getCollections();
},
methods: {
  async getCollections() {
  /**
   * Gets given user's collections
   */
    try {
      const r = await fetch(`/api/collections?username=${this.username}`);
      const res = await r.json();
      if (!r.ok) {
        throw new Error(res.error);
      }

      this.userCollections = res;
      if (!this.currentCollection) {
        this.currentCollection = this.userCollections[0]._id.toString();
      }
      this.getCollectionFreets(this.currentCollection);

    } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
    }
  },
  async getCollectionFreets(currentCollection) {
    /**
     * Gets freets in given collection
     */
    this.currentCollection = currentCollection;

    try {
      const r = await fetch(`/api/freets/collection/${this.currentCollection}`);
      if (!r.ok) {
      throw new Error(res.error);
    }

    const res = await r.json();
    this.currentCollectionFreets = res;

    } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
    }
  },
  async createCollection(collectionName) {
    /**
     * Gets freets in given collection
     */
     const options = {
        method: 'POST', headers: {'Content-Type': 'application/json'}
      };
    try {
      const r = await fetch(`/api/collection/${collectionName}`, options);
      if (!r.ok) {
        throw new Error(res.error);
      }
      
      const res = await r.json();
      this.userCollections.push(res);

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
/* 
form {
  border: 1px solid #111;
    padding: 20px;
    position: relative;
} */

.selected {
background-color:lightblue
}
</style>
  