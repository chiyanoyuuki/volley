import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {

  constructor() { }

  interdep : {prenom:string,nom:string,absent?:boolean,added?:boolean}[] = [{prenom:'Brice', nom:'HOARAU'},{prenom:'Mathieu', nom:'COYETTE'},{prenom:'Axel', nom:'DEFRANCE'},{prenom:'Theo', nom:'KABA'},{prenom:'Kemil', nom:'MEDANI'},
  {prenom:'Clément', nom:'MONCHIET'},{prenom:'Remy', nom:'PAILLE'},{prenom:'Étienne', nom:'RASSE'},{prenom:'Clément', nom:'ROBIN'},{prenom:'Charles', nom:'POURE'},
  {prenom:'Paul', nom:'LEMAIRE'},{prenom:'Nicolas', nom:'GERMACK'},{prenom:'Ata', nom:'TOZ'}];

  prenationnal : {prenom:string,nom:string,absent?:boolean,added?:boolean}[] = [{prenom:'Emmanuel', nom:'ALFRED'},{prenom:'Maxime', nom:'CADART'},{prenom:'Guillaume', nom:'BAUJOIN'},{prenom:'Sanka', nom:'CLAIR'},{prenom:'Mathéo', nom:'DEROY'},
  {prenom:'Alexis', nom:'DUBOIS'},{prenom:'Marc', nom:'DURR'},{prenom:'Remy', nom:'GAILLIEN'},{prenom:'Ludovic', nom:'GUILLET'},{prenom:'Lucas', nom:'LEBOUC'},
  {prenom:'Ugo', nom:'MINOT'},{prenom:'Soheil', nom:'MOKKADEM'},{prenom:'Théo', nom:'MOUGDON'},{prenom:'Guillaume', nom:'SERVAIS'},{prenom:'Pierre-loup', nom:'VAN KEIRSBLICK'}];
  
  equipes = [{nom:'Inter-Dép',joueurs:this.interdep}, {nom:'Pré-Nat',joueurs:this.prenationnal}];

  cote = true;
  selectedEquipe = this.equipes[0].nom;
  selectedTeamAddPlayer;
  selectedPlayerAdd;
  prenomAdd;
  nomAdd;
  date;

  ngOnInit(): void {

    this.interdep.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});
    this.prenationnal.sort((a,b)=>{if(a.prenom<b.prenom)return -1;else if(a.prenom>b.prenom)return 1;else return 0;});
    
    this.date = (formatDate(new Date(),'EEEE - dd/MM/yyyy','en'));
    var tmp = this.getOtherTeams();

    if(this.selectedTeamAddPlayer==undefined&&tmp.length>0)this.selectedTeamAddPlayer = tmp[0];
  }

  getEquipe()
  {
    var retour = this.equipes.find(e=>e.nom==this.selectedEquipe);
    if(retour!=null)
      return retour.joueurs;
    else
      return [];
  }

  changeEquipe()
  {
    var teams = this.equipes.filter(e=>e.nom!=this.selectedEquipe);
    this.selectedTeamAddPlayer = teams[0];
    this.prenomAdd = "";
    this.nomAdd = "";
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
