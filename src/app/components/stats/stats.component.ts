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
  actions : {joueur:any,action:any,resultat:any}[] = [];
  stats : {joueur:any,actions:any}[] = [];

  joueurs = [];
  equipes = [];
  joueurClicked;
  action = undefined;
  annuler = "Annuler dernière action";
  cote = true;
  date;
  menu = "equipe";
  adverse = "POINT ADVERSE";

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
  getStats(actions,action,resultat){let tmp = actions.filter(e=>e.action==action&&e.resultat==resultat).length;return tmp>0?tmp:' ';}
  getData(actions,demande)
  {
    if(demande=="VOLUME"){return actions.length}
    else if(demande=="EFFATTAQUE")
    {
      let tot=actions.filter(e=>e.action=="ATTAQUE").length;
      let totpos=actions.filter(e=>e.action=="ATTAQUE"&&(e.resultat=="POSITIF"||e.resultat=="POINT")).length;
      if(tot==0)return ' ';
      return ((totpos/tot)*100).toFixed()+'%';
    }
    else if(demande=="EFFRECEPTION")
    {
      let tot=actions.filter(e=>e.action=="RECEPTION").length;
      let totpos=actions.filter(e=>e.action=="RECEPTION"&&(e.resultat=="POSITIF"||e.resultat=="POINT")).length;
      if(tot==0)return ' ';
      return ((totpos/tot)*100).toFixed()+'%';
    }
    else if(demande=="EFFDEFENSE")
    {
      let tot=actions.filter(e=>e.action=="DEFENSE").length;
      let totpos=actions.filter(e=>e.action=="DEFENSE"&&(e.resultat=="POSITIF"||e.resultat=="POINT")).length;
      if(tot==0)return ' ';
      return ((totpos/tot)*100).toFixed()+'%';
    }
    else if(demande=="POINTSFAUTES"||demande=="RENDEMENT")
    {
      let totpoints=actions.filter(e=>e.resultat=="POINT").length;
      let totfautes=actions.filter(e=>e.resultat=="FAUTE").length;
      if(totpoints==0)return ' ';
      if(demande=="POINTSFAUTES")return totpoints+'/'+totfautes;
      if(demande=="RENDEMENT")return (((totpoints-totfautes)/totpoints)*100).toFixed()+'%';
    }
  }

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

  clickResult(result)
  {
    if(result=="POINT")
    {
      this.scores.points1++;
      if(this.scores.points1>=25&&this.scores.points1-this.scores.points2>1){this.scores.points1=0;this.scores.sets1++;this.scores.points2=0;}
    }
    else if(result=="FAUTE")
    {
      this.scores.points2++;
      if(this.scores.points2>=25&&this.scores.points2-this.scores.points1>1){this.scores.points2=0;this.scores.sets2++;this.scores.points1=0;}
    }

    let action = {joueur:this.joueurClicked,action:this.action,resultat:result};
    this.actions.push(action);

    let joueur = this.stats.find(e=>e.joueur==action.joueur);
    if(joueur){joueur.actions.push(action);}
    else{this.stats.push({joueur:action.joueur,actions:[action]});}

    this.joueurClicked = undefined;
    this.action = undefined;
  }



  clickAdverse()
  {
    this.joueurClicked = undefined;
    if(this.adverse=="POINT ADVERSE")
    {
      this.adverse = "VALIDER";
    }
    else if(this.adverse=="VALIDER")
    {
      this.adverse = "POINT ADVERSE";
      this.scores.points2++;
      if(this.scores.points2>=25&&this.scores.points2-this.scores.points1>1){this.scores.points2=0;this.scores.sets2++;this.scores.points1=0;}
    }
  }

  annulerAction()
  {
    if(this.actions.length>0)
    {
      this.joueurClicked = undefined;
      if(this.annuler=="Annuler dernière action")
      {
        this.annuler = "VALIDER";
      }
      else if(this.annuler=="VALIDER")
      {
        this.annuler = "Annuler dernière action";
        let action : any = this.actions.pop();
        if(action.resultat=="FAUTE"){this.scores.points2--;}
        else if(action.resultat=="POINT"){this.scores.points1--;}
      }
    }
  }

  deleteAction(action){this.actions.splice(this.actions.indexOf(action),1);}

}
