import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import equipes from '../../../assets/equipes.json';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {

  constructor() { }

  jours = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
  days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  select = {division:undefined,team:undefined,player:undefined,prenom:undefined,nom:undefined,
  sex:undefined,sexe:undefined};
  scores = {points1:0,sets1:0,points2:0,sets2:0}

  joueurs = [];
  equipes = [];
  action = undefined;
  cote = true;
  date;

  ngOnInit(): void 
  {
    this.equipes = equipes;
    this.equipes.forEach(division=>{
      division.equipes.forEach(sexe=>{
        let joueurs = sexe.joueurs;
        joueurs.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});
      })
    });

    this.date = (formatDate(new Date(),'EEEE - dd/MM/yyyy','en'));

    this.select.division = this.equipes.find(e=>e.nom!="Loisirs");
    this.select.sexe = this.select.division.equipes[0];
    let tmp = this.getOtherTeams();
    if(this.select.team==undefined&&tmp.length>0)
    {
      this.select.team = tmp[0];
      this.select.sex = this.select.team.equipes[0];
    }

    for(let i=0;i<6;i++)
    {
      this.joueurs.push(this.select.sexe.joueurs[i]);
    }
  }

  //GETTERS ====================================================================

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
  getOthers(){return this.select.sexe.joueurs.filter(e=>!this.joueurs.includes(e));}

  //OTHERS ============================================================================

  clickEleve()
  {

  }

  changeEquipe()
  {
    var teams = this.equipes.filter(e=>e.nom!=this.select.division);
    this.select.division = teams[0];
    this.select.prenom = "";
    this.select.nom = "";
  }

  changePlayerSelected()
  {
    this.select.prenom = this.select.player.prenom;
    this.select.nom = this.select.player.nom;
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

  clickPlayer()
  {

  }

  clickResult(action)
  {

  }

}
