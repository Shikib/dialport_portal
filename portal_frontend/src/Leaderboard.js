import React from "react";
import ReactDOM from "react-dom";


import './Leaderboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {Modal, Toast, ButtonToolbar, Button, Form, Container, Row, Col} from 'react-bootstrap';
import { useState, Component, PropTypes } from 'react';
import SortableTable from 'react-sortable-table';
window.React = require('react');

function Leaderboard() {
 
  const Sorter = {
  desc: (data, key) => {
      var result = data.sort(function (_a, _b) {
        const a = _a[key];
        const b = _b[key];
        if ( a <= b ) {
          return 1;
        } else if ( a > b) {
          return -1;
        }
      });
      return result;
    },
   
    asc: (data, key) => {
      return data.sort(function (_a, _b) {
        const a = _a[key];
        const b = _b[key];
        if ( a >= b ) {
          return 1;
        } else if ( a < b) {
          return -1;
        }
      })
    }
  };
 
 
  const [sub1_state, setSub1State] = useState(
    {
      data: [
        { name: 'Transformer Large', meteor: -1, bertscore: -1, usr: -1 },
        { name: 'Transformer Small', meteor: -1, bertscore: -1, usr: -1},
        { name: 'DialoGPT Small', meteor: -1, bertscore: -1, usr: -1},
        { name: 'DialoGPT Large', meteor: -1, bertscore: -1, usr: -1}
      ]
    }
  );

  const [sub2_state, setSub2State] = useState(
    {
      data: [
        { name: 'Transformer Large', meteor: -1, bertscore: -1, usr: -1 },
        { name: 'Transformer Small', meteor: -1, bertscore: -1, usr: -1},
        { name: 'DialoGPT Small', meteor: -1, bertscore: -1, usr: -1},
        { name: 'DialoGPT Large', meteor: -1, bertscore: -1, usr: -1}
      ]
    }
  );

  const [sub3_state, setSub3State] = useState(
    {
      data: [
        { name: 'Transformer Large', fed_overall: -1, overall: -1},
        { name: 'Transformer Small', fed_overall: -1, overall: -1},
      ]
    }
  );


  const setResults = (state) => {
    if(JSON.stringify(state['sub1']) !== JSON.stringify(sub1_state)) {
      setSub1State(state['sub1']);
    }

    if(JSON.stringify(state['sub2']) !== JSON.stringify(sub2_state)) {
      setSub2State(state['sub2']);
    }

    if(JSON.stringify(state['sub3']) !== JSON.stringify(sub3_state)) {
      setSub3State(state['sub3']);
    }
  }

  const getResults = () => {
    const Http = new XMLHttpRequest();
    const url = 'http://dialog.speech.cs.cmu.edu:8000/leaderboard';
    Http.open("GET", url);
    Http.send();
    
    Http.onreadystatechange = () => {
      if(Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {
        setResults(JSON.parse(Http.responseText));
      }
    }
  }

  getResults();

 
  
  const columns_sub1 = [
    {
      header: 'Name',
      key: 'name',
      defaultSorting: 'ASC',
      headerStyle: { fontSize: '15px'},
      dataStyle: { fontSize: '15px' },
      dataProps: { className: 'align-right' },
    },
    {
      header: 'METEOR',
      key: 'METEOR',
      headerStyle: { fontSize: '15px' },
      headerProps: { className: 'align-left' },
      descSortFunction: Sorter.desc,
      ascSortFunction: Sorter.asc,
      sortable: true,
    },
    {
      header: 'BERTscore',
      key: 'BERTScore',
      headerStyle: { fontSize: '15px' },
      headerProps: { className: 'align-left' },
      descSortFunction: Sorter.desc,
      ascSortFunction: Sorter.asc,
      sortable: true,
    },
    {
      header: 'USR (overall)',
      key: 'USR',
      headerStyle: { fontSize: '15px' },
      headerProps: { className: 'align-left' },
      descSortFunction: Sorter.desc,
      ascSortFunction: Sorter.asc,
      sortable: true,
    },
    {
      header: 'Human Rating (overall)',
      key: 'human',
      headerStyle: { fontSize: '15px' },
      headerProps: { className: 'align-left' },
      descSortFunction: Sorter.desc,
      ascSortFunction: Sorter.asc,
      sortable: true,
    },
  ];

  const columns_sub2 = [
    {
      header: 'Name',
      key: 'name',
      defaultSorting: 'ASC',
      headerStyle: { fontSize: '15px'},
      dataStyle: { fontSize: '15px' },
      dataProps: { className: 'align-right' },
    },
    {
      header: 'FED Dialog-Level (overall)',
      key: 'fed_overall',
      headerStyle: { fontSize: '15px' },
      headerProps: { className: 'align-left' },
      descSortFunction: Sorter.desc,
      ascSortFunction: Sorter.asc,
      sortable: true,
    },
    {
      header: 'Human (overall)',
      key: 'overall',
      headerStyle: { fontSize: '15px' },
      headerProps: { className: 'align-left' },
      descSortFunction: Sorter.desc,
      ascSortFunction: Sorter.asc,
      sortable: true,
    },
  ];

  const style = {
    backgroundColor: '#eee'
  };

  const iconStyle = {
    color: '#aaa',
    paddingLeft: '5px',
    paddingRight: '5px'
  };

  return (
    <div id="app">
      <h1>Leaderboards</h1> <br/> <br/>
      <h2>Subtask 1: Static Evaluation</h2>
      <h4>All Submissions</h4>
      <SortableTable
        data={sub1_state.data}
        columns={columns_sub1}
        style={style}
        iconStyle={iconStyle} />
      <h4>Submissions Without Pre-trained Models/Additional Data</h4>
      <SortableTable
        data={sub2_state.data}
        columns={columns_sub1}
        style={style}
        iconStyle={iconStyle} />
      <h2>Subtask 2: Interactive Evaluation</h2>
      <SortableTable
        data={sub3_state.data}
        columns={columns_sub2}
        style={style}
        iconStyle={iconStyle} />
    </div>
  );
}


export default Leaderboard;
