<template>
     <nav class="navbar">
        <div class="logo"> <span class="styleM">Post it</span>
        </div>
        <ul class="liste1">
          <li><router-link to="/" class="btndcon">Accueil</router-link></li>

          <li><router-link to="/details" class="btndcon">Détails</router-link></li>
        </ul>
    </nav><br>
    <br><br><br>
      <h1 style="color: black;">Mes Post-it</h1><br>
     <button @click="changeEtat">Ajouter le post-it</button><br>
  <div class="tout">
    <form @submit.prevent="ajouterNote" v-show="formVue">
      <div class="form-container">
        <h3 style="color: black;">Nouveau Post-it</h3>
        <label >Titre : </label>
        <input required v-model="nouveauTitre" placeholder="Titre de la note">
        <label >Contenu :</label><br>
        <textarea v-model="nouveauContenue" placeholder="Contenu..."></textarea><br>

        <label >Couleur :</label>
        <select v-model="nouvelleCouleur">
          <option value="orange">Orange</option>
          <option value="yellow">Jaune</option>
          <option value="green">Vert</option>
          <option value="blue">Bleu</option>
        </select>
        <button @click="submit" style="margin-top: 10%;">Valider</button>
      </div>
    </form>
  </div>
  <hr>
  <br>
  <div class="notes-list">
    <div v-for="(note, index) in notes" :key="index" class="post-it-card" :style="{backgroundColor: note.color}">
      <h4>{{ note.title }}</h4>
      <p v-if="note.content[0]>50">{{ Array.isArray(note.content)? note.content[0]: note.content.slice(0,50) }}...</p>
      <div style="display: flex;gap: 10px;justify-self: flex-start;margin-top: 15px;margin-bottom: 10px; margin-block-start: 50px;">
        <button @click="supprimerNote(note._id)">Supprimer</button>
        <button @click="Details(index)" style="">Voir plus +</button>
      </div>
    </div>
  </div>
<!-- <p>Titre: {{ nouveauTitre }}</p>
<p>Contenue: {{ nouveauContenue }}</p>
<p>coleur: {{ nouvelleCouleur }}</p> -->
<footer>

</footer>

</template>

<script>

export default{
  data(){
    return {
      notes:[],
      nouveauTitre: '',
      nouveauContenue: '',
      nouvelleCouleur: 'orange',
      formVue: false
    }
  },
  async created(){
    try{
      const reponse =await fetch(`https://postit.zoul.dev/notes`);
      const data =await reponse.json();
      this.notes= data.notes || data;
    }catch(error){
        console.error("le server ne repond pas:", error);
    }
    // const saveNotes = localStorage.getItem('postit_data');
    // if(saveNotes){
    //   this.notes = JSON.parse(saveNotes)
    // }
  },

  methods: {
  async ajouterNote(){
    const nouvelleNote ={
      title : this.nouveauTitre,
      content: [this.nouveauContenue],
      color: this.nouvelleCouleur,
    };

    try {
      const reponse= await fetch(`https://postit.zoul.dev/notes`,{method:'POST',headers:{'Content-Type': 'application/json'},body: JSON.stringify(nouvelleNote)});
      const noteCree = await reponse.json();
      this.notes.push(noteCree);

      this.nouveauTitre ='';
      this.nouvelleCouleur= 'orange';
      this.nouveauContenue='';
      this.formVue= false;
    } catch (error) {
      alert("Erreur d'envoi au server",error);
    }

    // this.notes.push(nouvelleNote);

    // localStorage.setItem('postit_data', JSON.stringify(this.notes))
    // this.nouveauTitre ='';
    // this.nouveauContenue='';
    // this.nouvelleCouleur= 'orange';
    // this.formVue= false;
    // console.log('ajouter avec succes!');
  },
  async supprimerNote(id){
    try{
      const reponse = await fetch(`https://postit.zoul.dev/notes/${id}`,{ method: 'DELETE'});
      console.log("staut de la reponse :", reponse.status);
      this.notes =this.notes.filter(note => note._id !==id);

    }catch(erreur){
      console.error("Erreur de suppression",erreur);
    }
    // this.notes.splice(index, 1);
    // localStorage.setItem('postit_data', JSON.stringify(this.notes))
  },
  changeEtat() {
    this.formVue = !this.formVue
  },
  Details(index){
    const noteSelectionnee = this.notes[index];
    localStorage.setItem('note_detail', JSON.stringify(noteSelectionnee));
    this.$router.push({
      name : 'detail-note',
    });
  }
}
}
</script>

<style>
form {
  max-width: 420px;
  margin: 30px;
  background: white;
  text-align: left;
  padding: 40px;
  border-radius: 10px;
}
.notes-list{
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 20px;
}
.post-it-card{
  border: 1px solid #ccc;
  background-color: rgb(248, 221, 248);
  padding: 10px;
  width: auto;
  min-height: 150px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 2);

}
label{
  color: #0a0606;
  display: inline-block;
  margin: 25px 0 15px;
  font-size: 0.6em;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
}
body{
  background-color: rgb(150, 91, 128);
}

input,select{
  display: block;
  padding: auto;
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #ddd;
  color: #555;
}
.navbar {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    box-shadow: 0.3em 0.3em 1em rgba(55, 55, 55, 0.6);
    border-radius: 20px;
    margin: 10px;
    width: 90%;
    max-width: 1200px;
    background-color: rgb(209, 178, 207);
    padding: 10px 10px;
    color: rgb(87, 87, 87);
    z-index: 11111;
}

.navbar div {
    display: flex;
    gap: 10px;
    align-items: center;
}

.liste1 {
    display: flex;
    gap: 20px;
}

li {
    list-style: none;
}

a {
    position: relative;
    text-decoration: none;
    color: #494949;
}

</style>
