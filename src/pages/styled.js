import styled from 'styled-components'

@media only screen and (max-width: 500px {
 .card-container {
    flex-wrap: wrap;
  }
  .card-container div.col {
    margin: 20px 0;
  }
  .card-badge {
    font-size: 151px !important;
  }
  .card-person-badge:first-of-type {
    height: 160px;
  }
  .card-person-badge {
    font-size: 58px !important;
  }
  .card-person-badge > svg {
    bottom: 61px !important;
  }
  .card-inbox-activity {
    pointer-events: none;
    top: 50px !important;
    left: 12% !important;
    width: 76px !important;
  }
  .heatmap-row {
    padding: 0px !important;
  }
  .title-text {
    font-size: 2.2rem !important;
  }
}
.person-wrapper {
  margin: 10px;
}
.break {
  flex-basis: 100%;
  height: 0;
}
.badge-primary[href]:focus, .badge-primary[href]:hover {
  color: var(--primary-bg);
}
.card-person-badge > svg {
  position: absolute;
  left: 0px;
  bottom: 64px;
}
.card-header {
  font-weight: 300 !important
}
.card-badge {
  font-size: 196px;
  cursor: pointer;
  color: var(--inv-font-color);
  border-radius: 0.325rem;
}
.card-unread-body {
  cursor: pointer;
  text-decoration: none;
  color: var(--secondary);
}
.card-person-badge {
  padding: 40px;
  font-size: 128px;
  border-radius: 0.325rem;
}
.card-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.card-stats {
  border-radius: 0.325em;
}
.card-inboxUnread {
  max-width: 250px;
  margin-top: 50px;
  border-radius: 0.625em;
}
.card-inboxUnread > a {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}
.card-person-body {
  display: flex;
  justify-content: center;
  padding: 1.275rem !important;
}
.card-body {
  display: flex;
  justify-content: center;
  padding: 1.275rem !important;
}
.card-body-text.person-text {
  display: block;
  position: absolute;
  top: 8px;
  right: -37px;
  width: 130px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  opacity: 1.0;
  transform: rotate(45deg);
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  background-color: #67B246;
  z-index: 500;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
}
.card-body-text.person-text::before {
  content: "";
  position: absolute; left: 0px; top: 100%;
  z-index: -1;
  border-left: 3px solid #529223;
  border-right: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-top: 3px solid #529223;
}
.card-body-text.person-text::after {
  content: "";
  position: absolute; right: 0px; top: 100%;
  z-index: -1;
  border-left: 3px solid transparent;
  border-right: 3px solid #529223;
  border-bottom: 3px solid transparent;
  border-top: 3px solid #529223;
}
.card-body-text.person-text.unread-text {
  background: #fff;
  color: #67B246;
}
.card-inbox-activity {
  position: absolute; 
  top: 171px;
  left: 70%;
  opacity: 0.1;
}
.react-calendar-heatmap text {
  font-size: 10px;
  fill: #aaa;
}
.react-calendar-heatmap .react-calendar-heatmap-small-text {
  font-size: 5px;
}
.react-calendar-heatmap rect:hover {
  stroke: #555;
  stroke-width: 1px;
}
.react-calendar-heatmap .color-empty {
  fill: var(--secondary-bg);
}
.react-calendar-heatmap .color-filled {
  fill: #8cc665;
}
.react-calendar-heatmap .color-github-0 {
  fill: #eeeeee;
}
.react-calendar-heatmap .color-github-1 {
  fill: #d6e685;
}
.react-calendar-heatmap .color-github-2 {
  fill: #8cc665;
}
.react-calendar-heatmap .color-github-3 {
  fill: #44a340;
}
.react-calendar-heatmap .color-github-4 {
  fill: #1e6823;
}
.react-calendar-heatmap .color-github-5 {
  fill: #16521a;
}
.react-calendar-heatmap .color-github-6 {
  fill: #114014;
}
.react-calendar-heatmap .color-github-7 {
  fill: #0a290c;
}
.react-calendar-heatmap .color-github-8 {
  fill: #051906;
}
.react-calendar-heatmap .color-github-9 {
  fill: #020a02;
}