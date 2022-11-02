<!-- Default page that also displays freets -->

<template>
  <section v-if="isEditing">
    <section class="collectionTitles">
      <button
        @click="getCollectionFreets(collection._id.toString())"
      >
        Save Changes
      </button>
      <section class="collectionTitlesOnly">
        <button
          v-for="collection in userCollections"
          :key="collection._id.toString()"
          :class="collection._id == currentCollection ? 'selected' : ''"
          @click="getCollectionFreets(collection._id.toString())"
        >
          {{ collection.title }}
        </button>
      </section>
      <AddCollectionForm
        ref="addCollectionForm"
        value=""
        placeholder="Enter Collection Name"
        button="Add Collection"
        @refresh="$store.commit('refreshCollections')"
      />
    </section>
  </section>
  <section v-else>
    <section class="collectionTitles">
      <section class="collectionTitlesOnly">
        <button
          v-for="collection in userCollections"
          :key="collection._id.toString()"
          :class="collection._id == currentCollection ? 'selected' : ''"
          @click="getCollectionFreets(collection._id.toString())"
        >
          {{ collection.title }}
        </button>
      </section>
    </section>
    <article
      v-if="currentCollectionFreets.length"
    >
      <FreetComponent
        v-for="freet in currentCollectionFreets"
        :key="freet.id"
        :freet="freet"
      />
    </article>
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
    currentCollection: null,
    currentCollectionFreets: [],
    isEditing: true
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
      this.getCollectionFreets(this.currentCollection ? this.currentCollection : this.userCollections[0]._id.toString());

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
    await this.collectionRequest('POST', collectionName);
  },
  async deleteCollection(collectionName) {
    /**
     * Gets freets in given collection
     */
    await this.collectionRequest('DELETE', collectionName);
  },
  async collectionRequest(method, collectionName) {
    /**
     * Gets freets in given collection
     */
     const options = {
        method: method, headers: {'Content-Type': 'application/json'}
      };
    try {
      const r = await fetch(`/api/collection/${collectionName}`, options);
      const res = await r.json();
      if (!r.ok) {
        throw new Error(res.error);
      }
      this.$store.commit('refreshCollections');

    } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
    }
  }
}
};
</script>

<style scoped>

.collectionTitles {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.collectionTitlesOnly {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

header, header > * {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button {
  margin-right: 5px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  border-style: none;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
  