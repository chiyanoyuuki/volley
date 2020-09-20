import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';

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

  jours = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
  days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  interdep = [{prenom:'Brice', nom:'HOARAU'},{prenom:'Mathieu', nom:'COYETTE'},{prenom:'Axel', nom:'DEFRANCE'},{prenom:'Theo', nom:'KABA'},{prenom:'Kemil', nom:'MEDANI'},
    {prenom:'Clément', nom:'MONCHIET'},{prenom:'Remy', nom:'PAILLE'},{prenom:'Étienne', nom:'RASSE'},{prenom:'Clément', nom:'ROBIN'},{prenom:'Charles', nom:'POURE'},
    {prenom:'Paul', nom:'LEMAIRE'},{prenom:'Nicolas', nom:'GERMACK'},{prenom:'Ata', nom:'TOZ'}];

  prenationnal = [{prenom:'Emmanuel', nom:'ALFRED'},{prenom:'Maxime', nom:'CADART'},{prenom:'Guillaume', nom:'BAUJOIN'},{prenom:'Sanka', nom:'CLAIR'},{prenom:'Mathéo', nom:'DEROY'},
    {prenom:'Alexis', nom:'DUBOIS'},{prenom:'Marc', nom:'DURR'},{prenom:'Remy', nom:'GAILLIEN'},{prenom:'Ludovic', nom:'GUILLET'},{prenom:'Lucas', nom:'LEBOUC'},
    {prenom:'Ugo', nom:'MINOT'},{prenom:'Soheil', nom:'MOKKADEM'},{prenom:'Théo', nom:'MOUGDON'},{prenom:'Guillaume', nom:'SERVAIS'},{prenom:'Pierre-loup', nom:'VAN KEIRSBLICK'}];

  entrainements = [
    {jour:'LUNDI'   ,creneaux:[]},

    {jour:'MARDI'   ,creneaux:[
      {type:'Masculine',equipe:'Inter-Dép',debut:'18h',fin:'20h',gymnase:'G.VALLEREY'}]},

    {jour:'MERCREDI',creneaux:[
      {type:'Masculine',equipe:'Pré-Nat',debut:'20h',fin:'22h',gymnase:'G.PELLERIN'},
      {type:'Masculine',equipe:'Inter-Dép',debut:'18h30',fin:'21h',gymnase:'G.VALLEREY'}]},

    {jour:'JEUDI',creneaux:[
      {type:'Masculine',equipe:'Pré-Nat',debut:'20h',fin:'22h30',gymnase:'P.HEDE'},
      {type:'Masculine',equipe:'Inter-Dép',debut:'20h',fin:'22h30',gymnase:'P.HEDE'}]},

    {jour:'VENDREDI',creneaux:[]},

    {jour:'SAMEDI',creneaux:[
      {type:'Masculine',equipe:'Pré-Nat',debut:'18h',fin:'22h30',gymnase:'G.PELLERIN'},
      {type:'Masculine',equipe:'Inter-Dép',debut:'13h',fin:'17h',gymnase:'G.PELLERIN'}]},

    {jour:'DIMANCHE',creneaux:[]}];

  absents = [];

  equipes = [{nom:'Inter-Dép',joueurs:this.interdep}, {nom:'Pré-Nat',joueurs:this.prenationnal}];

  entrainement;
  jourEntrainement;
  jour;
  heure;

  constructor() { }

  ngOnInit(): void {
    this.interdep.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});
    this.prenationnal.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});

    var date = (formatDate(new Date(),'EEEE - HH','en'));
    var jour = (date.substr(0,date.indexOf("-"))).replace(" ","");

    this.heure = (date.substr(date.indexOf("-")+1)).replace(" ","");
    this.jour = this.jours[this.days.indexOf(jour)];

    for(var i=8;i<24;i++)
    {
      this.heures.push((i<10?'0':'')+i+'h');
      this.heures.push(i+'h30');
    }

    this.getEntrainement();
  }

  test()
  {
    console.log(this.selectedGymnase);
  }

  getEntrainement()
  {
    this.entrainement = null;

    var tmp = this.entrainements.find(e=>e.jour==this.jour)
    var creneaux = tmp.creneaux;
    creneaux.forEach(e=>{
      var debut = e.debut.substr(0,2);
      var fin = e.fin.substr(0,2);

      if(this.heure>=debut&&this.heure<=fin)
        this.setEntrainement(e,tmp.jour);
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
    eleve.absent = !eleve.absent;
    eleve.absent?this.absents[this.absents.length]=eleve:this.absents.splice(this.absents.indexOf(eleve),1);
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

}