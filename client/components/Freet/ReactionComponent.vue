<template>
  <section>
    <section class="reactions">
      <button 
        class="reactionButtons"
        @click="toggleLikeState"
      >
        <p v-if="isLiked">
          &#128153;	
          Unlike
        </p>
        <p v-else>
          &#129293;
          Like
        </p>
      </button>
      <div class="dropup">
        <button
          class="reactionButtons"
        >
          <p>
            &#128193;
            Collections
          </p>
        </button>
        <div class="dropup-content">
          <a
            v-for="collection in filteredCollections"
            :key="collection._id.toString()"
            @click="toggleCollectionMembership(collection)"
          >
            <div v-if="collection.hasFreet">&#10004;{{ collection.title }}</div>
            <div v-else>{{ collection.title }}</div>
          </a>
        </div>
      </div>
    </section>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
  </section>
</template>
  
<script>
export default {
name: 'ReactionComponent',
props: {
    // Data from the stored freet
    freet: {
        type: Object,
        required: true
    }
},
data() {
  return {
    isLiked: false,
    filteredCollections: [],
    alerts: {}
  };
},
mounted() {
    this.setReactionState()
},
methods: {
  setReactionState() {
    // set like state
    this.isLiked = this.freet.likes.map(obj => obj.userId).includes(this.$store.state.userId);
    // set which collections freet is in
    for (const collection of this.$store.state.userCollections) {
        if (collection.title == "Likes") continue;
        var hasFreet = false;
        for (const postId of collection.posts) {
        if (postId == this.freet._id) {
            hasFreet = true;
            break;
        }
        }
        const newCollection = {_id: collection._id, title: collection.title, hasFreet};
        this.filteredCollections.push(newCollection);
    }
  },
  async toggleLikeState() {
    let param = "";
    const options = {
        headers: {'Content-Type': 'application/json'}
    };
    if (this.isLiked) {
        options.method = "DELETE";
        param = this.freet._id;
    } else {
        options.method = "POST";
        options.body = JSON.stringify({postId: this.freet._id});
    }

    try {
        const r = await fetch(`/api/likes/${param}`, options);
        if (!r.ok) {
        const res = await r.json();
        throw new Error(res.error);
        }

        this.isLiked = !this.isLiked;
        this.$emit('refreshContent');

    } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
    }
  },
  async toggleCollectionMembership(collection) {
    const options = {
        method: collection.hasFreet ? 'DELETE' : 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({freetId: this.freet._id})
    };

    try {
        const r = await fetch(`/api/collections/${collection.title}`, options);
        if (!r.ok) {
            const res = await r.json();
            throw new Error(res.error);
        }
        
        const message = collection.hasFreet ? `Removed From ${collection.title}` : `Added to ${collection.title}`;
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);

        collection.hasFreet = !collection.hasFreet;
        this.$emit('refreshContent');

    } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
    }
  },
}
};
</script>

<style scoped>

.info {
color:gray;
font-size: small;
}

.reactions {
    display: flex;
    justify-content: center;
    align-items: flex-end;;
}

.reactionButtons {
    padding: 0;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 10px;
    font-size: medium;
    font-weight: bold;
    background-color: white;
    margin-right: 10px;
}

/* Dropup Button */
.dropbtn {
background-color: #3498DB;
color: white;
padding: 16px;
font-size: 16px;
border: none;
}

/* The container <div> - needed to position the dropup content */
.dropup {
display: inline-block;
position: relative;
}

/* Dropup content (Hidden by Default) */
.dropup-content {
display: none;
position: absolute;
bottom: 50px;
background-color: #f1f1f1;
min-width: 160px;
box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
z-index: 1;
}

/* Links inside the dropup */
.dropup-content a {
color: black;
padding: 12px 16px;
text-decoration: none;
display: block;
}

/* Change color of dropup links on hover */
.dropup-content a:hover {background-color: #ddd}

/* Show the dropup menu on hover */
.dropup:hover .dropup-content {
display: block;
}

/* Change the background color of the dropup button when the dropup content is shown */
.dropup:hover .dropbtn {
background-color: #2980B9;
}

</style>