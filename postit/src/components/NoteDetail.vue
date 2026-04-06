<template>
  <div class="detail-container">
    <button @click="$router.push('/')" class="btn-retou"> Retour</button>

    <div v-if="note" class="post-it-detail" :style="{backgroundColor: note.color}">
      <h2>{{ note.title }}</h2>
      <hr>
      <p class="contenu"> {{ Array.isArray(note.content)? note.content[0]: note.content}}</p>
      <div style="display: flex;gap: 10px;justify-self: flex-start;margin-top: 15px;margin-bottom: 10px; margin-block-start: 50px;">
          <button @click="supprimerNote(note._id)">Supprimer</button>
          <button @click="Modifier()" style="">Modifier</button>
      </div>
    </div>
    <div v-else >
      <p>Aucune note</p>
      <button @click="$router.push('/')"> Retour a l'acceuil</button>
    </div>
  </div>
</template>

<script>
export default{
  data(){
    return{
      note :null
    }
  },
   created(){
    const saveNote = localStorage.getItem('note_detail');
    if(saveNote){
      this.note = JSON.parse(saveNote)
    }
  },
    methods: {
     async supprimerNote(id){
      try {
        await fetch(`https://postit.zoul.dev/notes/${id}`,{method: 'DELETE'});
        localStorage.removeItem('note_detail');
        this.$router.push('/');
      } catch (error) {
        console.error("Erreur de Supprimer",error);
      }
      // this.notes.splice(index, 1);
      // localStorage.setItem('postit_data', JSON.stringify(this.notes))
    }
  }
}
</script>
