import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit 
{
  gymnases = ['G.VALLEREY','G.PELLERIN','P.HEDE'];
  heures = [];
  types = ['Masculine','Feminine'];

  selectedGymnase;
  selectedJour;
  selectedDebut;
  selectedFin;
  selectedEquipe;
  selectedType;
  selectedTeamAddPlayer;
  selectedPlayerAdd;
  prenomAdd;
  nomAdd;

  jours = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
  days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  interdep : {prenom:string,nom:string,absent?:boolean,added?:boolean}[] = [{prenom:'Brice', nom:'HOARAU'},{prenom:'Mathieu', nom:'COYETTE'},{prenom:'Axel', nom:'DEFRANCE'},{prenom:'Theo', nom:'KABA'},{prenom:'Kemil', nom:'MEDANI'},
    {prenom:'Clément', nom:'MONCHIET'},{prenom:'Remy', nom:'PAILLE'},{prenom:'Étienne', nom:'RASSE'},{prenom:'Clément', nom:'ROBIN'},{prenom:'Charles', nom:'POURE'},
    {prenom:'Paul', nom:'LEMAIRE'},{prenom:'Nicolas', nom:'GERMACK'},{prenom:'Ata', nom:'TOZ'}];

  prenationnal : {prenom:string,nom:string,absent?:boolean,added?:boolean}[] = [{prenom:'Emmanuel', nom:'ALFRED'},{prenom:'Maxime', nom:'CADART'},{prenom:'Guillaume', nom:'BAUJOIN'},{prenom:'Sanka', nom:'CLAIR'},{prenom:'Mathéo', nom:'DEROY'},
    {prenom:'Alexis', nom:'DUBOIS'},{prenom:'Marc', nom:'DURR'},{prenom:'Remy', nom:'GAILLIEN'},{prenom:'Ludovic', nom:'GUILLET'},{prenom:'Lucas', nom:'LEBOUC'},
    {prenom:'Ugo', nom:'MINOT'},{prenom:'Soheil', nom:'MOKKADEM'},{prenom:'Théo', nom:'MOUGDON'},{prenom:'Guillaume', nom:'SERVAIS'},{prenom:'Pierre-loup', nom:'VAN KEIRSBLICK'}];

  entrainements = [
    {jour:'LUNDI'   ,creneaux:[
      {type:'Masculine',equipe:'Inter-Dép',debut:'18h00',fin:'20h00',gymnase:'P.HEDE'},
      {type:'Masculine',equipe:'Pré-Nat',debut:'20h00',fin:'22h30',gymnase:'P.HEDE'}]},

    {jour:'MARDI'   ,creneaux:[]},

    {jour:'MERCREDI',creneaux:[
      {type:'Masculine',equipe:'Inter-Dép',debut:'16h00',fin:'18h00',gymnase:'G.VALLEREY'}]},

    {jour:'JEUDI',creneaux:[
      {type:'Masculine',equipe:'Inter-Dép',debut:'18h00',fin:'20h00',gymnase:'G.VALLEREY'},
      {type:'Masculine',equipe:'Pré-Nat',debut:'20h00',fin:'22h30',gymnase:'G.PELLERIN'}]},

    {jour:'VENDREDI',creneaux:[]},

    {jour:'SAMEDI',creneaux:[
      {type:'Masculine',equipe:'Inter-Dép',debut:'13h00',fin:'17h00',gymnase:'G.PELLERIN'},
      {type:'Masculine',equipe:'Pré-Nat',debut:'18h00',fin:'22h30',gymnase:'G.PELLERIN'}]},

    {jour:'DIMANCHE',creneaux:[]}];

  equipes = [{nom:'Inter-Dép',joueurs:this.interdep}, {nom:'Pré-Nat',joueurs:this.prenationnal}];

  entrainement;
  jourEntrainement;
  jour;
  heure;
  mailEnvoye;

  constructor(private http: HttpClient) { }

  ngOnInit(): void 
  {
    this.equipes.forEach(e=>{
      var joueurs = e.joueurs;
      joueurs.forEach(j=>j.absent=true)
    })

    this.interdep.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});
    this.prenationnal.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});

    var date = (formatDate(new Date(),'EEEE - HH','en'));
    var jour = (date.substr(0,date.indexOf("-"))).replace(" ","");

    this.heure = (date.substr(date.indexOf("-")+1)).replace(" ","");
    this.jour = this.jours[this.days.indexOf(jour)];

    for(var i=8;i<24;i++)
    {
      this.heures.push((i<10?'0':'')+i+'h00');
      this.heures.push(i+'h30');
    }

    this.getEntrainement();

    var tmp = this.getOtherTeams();

    if(this.selectedTeamAddPlayer==undefined&&tmp.length>0)this.selectedTeamAddPlayer = tmp[0];
  }

  getEntrainement()
  {
    this.entrainement = null;

    var tmp = this.entrainements.find(e=>e.jour==this.jour)
    var creneaux = tmp.creneaux;
    creneaux.forEach(e=>{
      var debut = e.debut.substr(0,2);
      var fin = e.fin.substr(0,2);

      if(this.entrainement==null)
      {
        if(this.heure>=debut&&this.heure<=fin)
          this.setEntrainement(e,tmp.jour);
        else if(this.heure<debut)
          this.setEntrainement(e,tmp.jour);
      }
    });

    while(this.entrainement==null)
    {
      tmp = this.entrainements[((this.entrainements.indexOf(tmp))+1)%7];
      creneaux = tmp.creneaux;
      if(creneaux.length>0)
        this.setEntrainement(creneaux[0],tmp.jour);
    }
  }

  setEntrainement(e,jour)
  {
    this.entrainement = e;
    this.jourEntrainement = jour;

    this.selectedGymnase = e.gymnase;
    this.selectedJour = jour;
    this.selectedDebut = e.debut;
    this.selectedFin = e.fin;
    this.selectedEquipe = e.equipe;
    this.selectedType = e.type;
  }

  clickEleve(eleve)
  {
    if(eleve.added==true)
    {
      var equipe = this.getEquipe();
      equipe.splice(equipe.indexOf(eleve),1);
      this.prenomAdd = eleve.prenom;
      this.nomAdd = eleve.nom;
    }
    else
    {
      eleve.absent = !eleve.absent;
    }
  }

  getEntrainements(journee)
  {
    var retour = [];
    this.entrainements.forEach(function(e){if(e.jour==journee)retour = e.creneaux;})
    retour.sort((a,b)=>{if(a.debut<b.debut)return -1;else if(a.debut>b.debut)return 1;else return 0;});
    return retour;
  }

  getEquipe()
  {
    var retour = this.equipes.find(e=>e.nom==this.selectedEquipe);
    if(retour!=null)
      return retour.joueurs;
    else
      return [];
  }

  sendEmail()
  {
    var gymnase = this.selectedGymnase;
    var jour = this.selectedJour;
    var debut = this.selectedDebut;
    var fin = this.selectedFin;
    var equipe = this.selectedEquipe;
    var type = this.selectedType;
    var joueurs = this.getEquipe();

    var joueurs2 = [];
    var absents = [];
    var date = jour + ' : ' + debut + ' - ' + fin;
    var equipe2 = equipe + ' ' + type;

    joueurs.forEach(e=>{
      var ligne = e.prenom+' '+e.nom;
      e.absent?absents.push(ligne):joueurs2.push(ligne);
    });

      this.mailEnvoye = false;
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      this.http.post('https://formspree.io/maylyeno',
        { Gymnase:gymnase, Date:date, Equipe:equipe2, Joueurs:joueurs2, Absents:absents},
        { 'headers': headers }).subscribe(
          response => {
            this.mailEnvoye = true;
          }
        );
  }

  getAbsents()
  {
    var equipe = this.getEquipe();
    var absents = equipe.filter(e=>e.absent==true);
    return absents;
  }

  getNbAbsents()
  {
    var taille = this.getAbsents().length;
    var taille2 = this.getEquipe().length;
    return (taille2-taille) + '/' + taille2 + ' présent' + (taille>1?'s':'');
  }

  getOtherTeams()
  {
    var teams = this.equipes.filter(e=>e.nom!=this.selectedEquipe);
    return teams;
  }

  getplayersSelectedTeam()
  {
    var equipe = this.selectedTeamAddPlayer;
    if(equipe!=undefined)
    {
      var otherJoueurs = equipe.joueurs;
      var joueurs = this.getEquipe();
      return otherJoueurs.filter(e=>!joueurs.find(j=>j.nom==e.nom&&j.prenom==e.prenom));
    }
    return [];
  }

  changePlayerSelected()
  {
    this.prenomAdd = this.selectedPlayerAdd.prenom;
    this.nomAdd = this.selectedPlayerAdd.nom;
  }

  changeEquipe()
  {
    var teams = this.equipes.filter(e=>e.nom!=this.selectedEquipe);
    this.selectedTeamAddPlayer = teams[0];
    this.prenomAdd = "";
    this.nomAdd = "";
  }

  ajouterJoueur()
  {
    if(this.prenomAdd!=""&&this.nomAdd!="")
    {
      var equipe = this.getEquipe();
      equipe.push({prenom:this.prenomAdd,nom:this.nomAdd,added:true});
      this.prenomAdd = "";
      this.nomAdd = "";
      equipe.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});
    }
  }

}