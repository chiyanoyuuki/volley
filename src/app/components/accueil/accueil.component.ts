import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import equipes from '../../../assets/equipes.json';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit 
{
  jours = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
  days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  gymnases = ['G.VALLEREY','G.PELLERIN','P.HEDE'];
  heures = [];

  select = {division:undefined,sexe:undefined,gymnase:undefined,jour:undefined,debut:undefined,
    fin:undefined,team:undefined,player:undefined,prenom:undefined,nom:undefined,sex:undefined};


  equipes = []; 
  entrainement;
  jourEntrainement;
  jour;
  heure;
  mailEnvoye;

  constructor(private http: HttpClient) { }

  ngOnInit(): void 
  {
    this.equipes = equipes;
    this.equipes.forEach(division=>{
      division.equipes.forEach(sexe=>{
        let joueurs = sexe.joueurs;
        joueurs.forEach(joueur=>joueur.absent=true);
        joueurs.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});
      })
    });

    let date = (formatDate(new Date(),'EEEE - HH','en'));
    let jour = (date.substr(0,date.indexOf("-"))).replace(" ","");
    this.heure = (date.substr(date.indexOf("-")+1)).replace(" ","");
    this.jour = this.jours[this.days.indexOf(jour)];
    for(let i=8;i<24;i++){this.heures.push((i<10?'0':'')+i+'h00');this.heures.push(i+'h30');}

    this.getEntrainement();
    let tmp = this.getOtherTeams();
    if(this.select.team==undefined&&tmp.length>0)
    {
      this.select.team = tmp[0];
      this.select.sex = this.select.team.equipes[0];
    }
  }

  
  //GETTERS====================================================

  getEntrainement()
  {
    this.entrainement = null;

    this.equipes.forEach(division=>
    {
      division.equipes.forEach(sexe=>{
        if(this.entrainement==null)
        {
          let training = sexe.entrainements;
          let jourEntrainement = training.find(e=>e.jour==this.jour)
          let creneaux = jourEntrainement.creneaux;
          creneaux.forEach(e=>{
            let debut = e.debut.substr(0,2);
            let fin = e.fin.substr(0,2);
      
            if(this.entrainement==null)
            {
              if(this.heure>=debut&&this.heure<=fin)
                this.setEntrainement(division,sexe,e,jourEntrainement.jour);
              else if(this.heure<debut)
                this.setEntrainement(division,sexe,e,jourEntrainement.jour);
            }
          });
        };
      });
    });

    this.equipes.forEach(division=>
    {
      division.equipes.forEach(sexe=>{
        if(this.entrainement==null)
        {
          while(this.entrainement==null)
          {
            let training = sexe.entrainements;
            let jourEntrainement = training.find(e=>e.jour==this.jour)
            jourEntrainement = training[((training.indexOf(jourEntrainement))+1)%7];
            let creneaux = jourEntrainement.creneaux;
            if(creneaux.length>0)
              this.setEntrainement(division,sexe,creneaux[0],jourEntrainement.jour);
          }
        }
      })
    });
  }
  getEntrainements(journee)
  {
    let retour = this.select.sexe.entrainements.find(e=>e.jour==journee).creneaux;
    retour.sort((a,b)=>{if(a.debut<b.debut)return -1;else if(a.debut>b.debut)return 1;else return 0;});
    return retour;
  }
  getplayersSelectedTeam()
  {
    if(this.select.sex==undefined)return [];
    let otherJoueurs = this.select.team.equipes.find(e=>e.nom==this.select.sex.nom);
    if(otherJoueurs==undefined)return [];
    otherJoueurs = otherJoueurs.joueurs;
    let joueurs = this.select.sexe.joueurs;
    return otherJoueurs.filter(e=>!joueurs.find(j=>j.nom==e.nom&&j.prenom==e.prenom));
  }
  getSexs(){return this.select.team.equipes;}
  getSexes(){return this.select.division.equipes;}
  getOtherTeams(){return this.equipes.filter(e=>e.nom!=this.select.division.nom&&e.nom!='Loisirs');}
  getAbsents(){return this.select.sexe.joueurs.filter(e=>e.absent==true);}
  getNbAbsents(){
    let taille = this.getAbsents().length;
    let taille2 = this.select.sexe.joueurs.length;
    return (taille2-taille) + '/' + taille2 + ' présent' + (taille>1?'s':'');
  }

  //SETTERS====================================================

  setEntrainement(division,sexe,creneaux,jour)
  {
    this.entrainement = creneaux;
    this.jourEntrainement = jour;
    this.select.gymnase = creneaux.gymnase;
    this.select.jour = jour;
    this.select.debut = creneaux.debut;
    this.select.fin = creneaux.fin;

    this.select.division = division;
    this.select.sexe = sexe;
  }
  setEntrainement2(creneaux,jour)
  {
    this.entrainement = creneaux;
    this.jourEntrainement = jour;
    this.select.gymnase = creneaux.gymnase;
    this.select.jour = jour;
    this.select.debut = creneaux.debut;
    this.select.fin = creneaux.fin;
  }

  //OTHERS====================================================
  
  clickEleve(eleve)
  {
    if(eleve.added==true)
    {
      let equipe = this.select.sexe.joueurs;
      equipe.splice(equipe.indexOf(eleve),1);
      this.select.prenom = eleve.prenom;
      this.select.nom = eleve.nom;
    }
    else
    {
      eleve.absent = !eleve.absent;
    }
  }

  sendEmail()
  {
    let gymnase = this.select.gymnase;
    let jour = this.select.jour;
    let debut = this.select.debut;
    let fin = this.select.fin;
    let equipe = this.select.division.nom;
    let type = this.select.sexe.nom;
    let joueurs = this.select.sexe.joueurs;

    let joueurs2 = [];
    let absents = [];
    let date = jour + ' : ' + debut + ' - ' + fin;
    let equipe2 = equipe + ' ' + type;

    joueurs.forEach(e=>{
      let ligne = e.prenom+' '+e.nom;
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

  changePlayerSelected()
  {
    this.select.prenom = this.select.player.prenom;
    this.select.nom = this.select.player.nom;
  }

  changeEquipe()
  {
    let teams = this.equipes.filter(e=>e.nom!=this.select.division.nom);
    this.select.team = teams[0];
    this.select.prenom = "";
    this.select.nom = "";
  }

  ajouterJoueur()
  {
    if(this.select.prenom!=""&&this.select.nom!=""&&
    !this.select.sexe.joueurs.find(e=>e.prenom==this.select.prenom&&e.nom==this.select.nom))
    {
      let equipe = this.select.sexe.joueurs;
      equipe.push({prenom:this.select.prenom,nom:this.select.nom,added:true});
      this.select.prenom = "";
      this.select.nom = "";
      equipe.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});
    }
  }

}