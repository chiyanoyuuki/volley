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

  messages = [
    /*0*/"Choisissez dans la liste le joueur qui sera libéro",
    /*1*/"Choisissez maintenant un joueur dans la liste, puis placez le sur le terrain",
    /*2*/"Choisissez enfin le rôle du joueur",
    /*3*/"Cliquez sur le joueur dans la liste en dessous qui sera le capitaine",
    /*4*/"A qui est le service ?",
    /*5*/"Pour effectuer un changement, cliquez sur un joueur dans la liste en dessous puis sur le joueur par qui il sera remplacé"
  ];
  message = 0;

  jours = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
  days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  select = {division:undefined,team:undefined,player:undefined,prenom:undefined,nom:undefined,
  sex:undefined,sexe:undefined};
  scores = {points1:0,sets1:0,points2:0,sets2:0}
  actions : {joueur:any,action:any,resultat:any}[] = [];
  changements : {sort:any,rentre:any}[] = [];
  stats : {joueur:any,actions:any}[] = [];

  joueurs:{capitaine?,role?,prenom?,nom?,numero?}[] = [{},{},{},{},{},{}];
  joueurCote:{capitaine?,role?,prenom?,nom?,numero?} = {};

  service:boolean;

  serviceSet = undefined;
  nb = 0;
  equipes = [];
  joueurClicked;
  eleveClicked;
  action = undefined;
  annuler = "Annuler dernière action";
  cote = true;
  date;
  menu = "equipe";
  adverse = "POINT ADVERSE";
  adverse2 = "FAUTE ADVERSE";

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
  getJoueurs(){let retour = this.joueurs.filter(e=>e.prenom!=undefined);if(this.joueurCote.prenom!=undefined)retour.push(this.joueurCote); return retour;}
  getOthers(){return this.select.sexe.joueurs.filter(e=>!this.joueurs.includes(e)&&e!=this.joueurCote);}
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
  getTerrain()
  {
    let retour = [];
    for(let i=0;i<6;i++)
    {
      retour[i] = this.joueurs[(i+this.nb)%6];
    }
    return retour;
  }

  //OTHERS ============================================================================

  cancelRole(i){this.joueurs[i]={};this.message=1;}
  clickJoueur(i,joueur)
  {
    if(this.message==1)
    {
      if(this.eleveClicked!=undefined)
      {
        this.joueurs[i] = this.eleveClicked;
        this.message=2;
        let player = this.joueurs[(i+3)%6];
        console.log(player);
        if(player.role!=undefined)
        {
            if(player.role=="R4")this.setRole("R4");
            else if(player.role=="PASSEUR")this.setRole("POINTU");
            else if(player.role=="CENTRAL")this.setRole("CENTRAL");
            else if(player.role=="POINTU")this.setRole("PASSEUR");
        }
      }
    }
    else if(this.message==5)
    {
      if(this.joueurClicked!=joueur){this.action=undefined;}

      this.joueurClicked = joueur;
      this.adverse='POINT ADVERSE';
      this.adverse2='FAUTE ADVERSE';
    }
  }

  setRole(role)
  {
    this.eleveClicked.role=role;
    let manque = this.joueurs.filter(e=>e.role==undefined).length;
    if(manque>0){this.askNewJoueur();}else{this.endAskJoueurs();}
  }

  clickRole(role)
  {
    if(role=="R4")
    {
      let nb = this.joueurs.filter(e=>e.role=="R4").length;
      if(nb==0){this.setRole("R4");}
    }
    else if(role=="PASSEUR")
    {
      let nb = this.joueurs.filter(e=>e.role=="PASSEUR").length;
      let nb2 = this.joueurs.filter(e=>e.role=="POINTU").length;
      if(nb==0&&nb2==0){this.setRole("PASSEUR");}
    }
    else if(role=="POINTU")
    {
      let nb = this.joueurs.filter(e=>e.role=="PASSEUR").length;
      let nb2 = this.joueurs.filter(e=>e.role=="POINTU").length;
      if(nb==0&&nb2==0){this.setRole("POINTU");}
    }
    else if(role=="CENTRAL")
    {
      let nb = this.joueurs.filter(e=>e.role=="CENTRAL").length;
      if(nb==0){this.setRole("CENTRAL");}
    }
  }

  askNewJoueur(){this.eleveClicked=undefined;this.joueurClicked=undefined;this.message=1;}
  endAskJoueurs(){this.eleveClicked=undefined;this.joueurClicked=undefined;this.message=3;}

  changeService()
  {
    if(!this.service)this.nb++;
    this.service = !this.service;
    this.central();
    if(!this.service)this.libero();
  }

  changeService2()
  {
    this.service = !this.service;
    this.central();
    this.libero();
  }

  setService(bool)
  {
    this.serviceSet = bool;
    this.service=bool;
    this.message=5;
    this.central();
    this.libero();
  }

  rotation()
  {
    this.nb++;
    this.central();
    this.libero();
  }

  central()
  {
    let libero = this.joueurs.find(e=>e.role=="LIBERO");
    if(libero)
    {
      let i = this.joueurs.indexOf(libero);
      let tmp = this.joueurCote;
      this.joueurs[i]=tmp;
      this.joueurCote=libero;
    }    
  }

  libero()
  {
    let central;
    let i =-1;
    if(this.joueurs[(0+this.nb)%6].role=="CENTRAL"&&!this.service)i = (0+this.nb)%6;
    else if(this.joueurs[(4+this.nb)%6].role=="CENTRAL")i = (4+this.nb)%6;
    else if(this.joueurs[(5+this.nb)%6].role=="CENTRAL")i = (5+this.nb)%6;
    if(i!=-1)
    {
      central = this.joueurs[i];
      let tmp = this.joueurCote;
  
      this.joueurs[i]=tmp;
      this.joueurCote=central;
    }
  }

  clickEleve(eleve)
  {
    if(this.message==0)
    {
      if(this.eleveClicked!=eleve)
      {
        this.eleveClicked=eleve;
      }
      else
      {
        eleve.role="LIBERO";
        this.joueurCote = eleve;
        this.eleveClicked = undefined;
        this.message++;
      }
    }
    else if(this.message==1){this.eleveClicked=eleve;}
    else if(this.message==3)
    {
      if(this.eleveClicked!=eleve)
      {
        this.eleveClicked=eleve;
      }
      else
      {
        let joueur = this.select.sexe.joueurs.find(e=>e==eleve);
        joueur.capitaine = true;
        this.eleveClicked = undefined;
        if(this.serviceSet==undefined){this.message=4;}
        else
        {
          this.message=5;
          this.serviceSet = !this.serviceSet;
          this.service = this.serviceSet;
        }
      }
    }
    else if(this.message==5)
    {
      if(this.eleveClicked!=undefined)
      {
        if(this.eleveClicked==this.joueurCote)
        {
          eleve.role = this.joueurCote.role;
          this.joueurCote.role = "";

          this.changements.push({sort:this.joueurCote,rentre:eleve});
  
          this.joueurCote=eleve;
          this.joueurClicked=undefined;
        }
        else
        {
          let i = this.joueurs.indexOf(this.eleveClicked);
          let sort = this.joueurs[i];
          
          this.changements.push({sort:sort,rentre:eleve});
  
          eleve.role = sort.role;
          sort.role = "";
  
          this.joueurs[i]=eleve;
          this.joueurClicked=undefined;
        }
      }
    }
  }

  clickEquipe(eleve)
  {
    if(this.message==3)
    {
      if(this.eleveClicked!=eleve)
      {
        this.eleveClicked=eleve;
      }
      else
      {
        let joueur = this.select.sexe.joueurs.find(e=>e==eleve);
        joueur.capitaine = true;
        this.eleveClicked = undefined;
        if(this.serviceSet==undefined){this.message=4;}
        else
        {
          this.message=5;
          this.serviceSet = !this.serviceSet;
          this.service = this.serviceSet;
        }
      }
    }
    else if(this.message==5)
    {
      if(this.eleveClicked!=eleve)
      {
        this.eleveClicked=eleve;
      }
      else
      {
        this.eleveClicked=undefined;
      }
    }
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
    if(result=="POINT"){this.addPoint(1);}
    else if(result=="FAUTE"){this.addPoint(2);}

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
    this.adverse2 = "FAUTE ADVERSE";
    this.joueurClicked = undefined;
    if(this.adverse=="POINT ADVERSE")
    {
      this.adverse = "VALIDER";
    }
    else if(this.adverse=="VALIDER")
    {
      this.adverse = "POINT ADVERSE";
      this.addPoint(2);
    }
  }

  clickAdverse2()
  {
    this.adverse = "POINT ADVERSE";
    this.joueurClicked = undefined;
    if(this.adverse2=="FAUTE ADVERSE")
    {
      this.adverse2 = "VALIDER";
    }
    else if(this.adverse2=="VALIDER")
    {
      this.adverse2 = "FAUTE ADVERSE";
      this.addPoint(1);
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

  addPoint(i)
  {
    if(i==1)
    {
      this.scores.points1++;
      if(!this.service){this.changeService();}
      if(this.scores.points1>=25&&this.scores.points1-this.scores.points2>1){this.finirSet(1);}
    }
    else
    {
      this.scores.points2++;
      if(this.service){this.changeService();}
      if(this.scores.points2>=25&&this.scores.points2-this.scores.points1>1){this.finirSet(2);}
    }
  }

  finirSet(i)
  {
    this.scores.points1=0;
    this.scores.points2=0;
    if(i==1)
    {
      this.scores.sets1++;
    }
    else
    {
      this.scores.sets2++;
    }
    this.adverse = "POINT ADVERSE";
    this.adverse2 = "FAUTE ADVERSE";
    this.eleveClicked = undefined;
    this.joueurClicked = undefined;
    this.message = 0;
    this.joueurs = [{},{},{},{},{},{}];
    this.joueurCote = {};
  }

  deleteAction(action){this.actions.splice(this.actions.indexOf(action),1);}

}
