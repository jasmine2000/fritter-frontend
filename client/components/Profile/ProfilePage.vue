<!-- Profile page -->

<template>
  <main>
    <section>
      <ProfileHeaderComponent />
      <section class="wide-buttons">
        <button
          :class="freetView ? 'selected' : ''"
          @click="freetView=true"
        >
          View Freets
        </button>
        <button
          :class="!freetView ? 'selected' : ''"
          @click="freetView=false"
        >
          View Collections
        </button>
      </section>
      <section
        v-if="freetView"
      >
        <FreetListComponent />
      </section>
      <section
        v-else
      >
        <CollectionsComponent />
      </section>
    </section>
  </main>
</template>

<script>
import FreetListComponent from '@/components/Profile/FreetListComponent.vue';
import CollectionsComponent from '@/components/Profile/CollectionsComponent.vue';
import ProfileHeaderComponent from '@/components/Profile/ProfileHeaderComponent.vue';

export default {
  name: 'ProfilePage',
  components: {FreetListComponent, CollectionsComponent, ProfileHeaderComponent},
  data() {
    return {
      username: this.$route.params.username,
      freetView: true,
    };
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

.wide-buttons {
  display: flex;
  align-content: center;
  width: 50pc;
}

.selected {
  background-color:lightblue
}
</style>
