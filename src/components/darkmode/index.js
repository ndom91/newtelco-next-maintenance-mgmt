import React from "react"
// import { ThemeProvider } from 'styled-components'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons"

import * as S from "./styles"

const DarkmodeSwitch = ({ value, onChange }) => {
  return (
    <ThemeProvider theme={{ clicked: value }}>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <S.Wrapper
          onClick={onChange}
          role="button"
          className="darkmode-wrapper"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.which === 13 || e.which === 32) {
              onChange(e)
            }
          }}
        >
          <S.DayNightSwitch
            style={
              value
                ? { backgroundColor: "#272727" }
                : { backgroundColor: "#67B246" }
            }
          >
            <S.Stars>
              <S.Star index={1} size={2} x={10} y={3} />
              <S.Star index={2} size={1} x={3} y={7} />
              <S.Star index={3} size={1} x={12} y={18} />
              <S.Star index={4} size={1} x={15} y={10} />
              <S.Star index={5} size={1} x={19} y={4} />
              <S.Star index={6} size={2} x={22} y={14} />
            </S.Stars>
            <S.Circle
              style={
                value
                  ? {
                      backgroundColor: "#272727",
                      border: "2px solid #fff",
                      color: "#fff",
                    }
                  : {
                      backgroundColor: "#797676",
                      border: "2px solid #fff",
                      color: "#fff",
                    }
              }
            >
              {/* <S.Moon icon={faMoon} />  */}
              {value ? (
                <FontAwesomeIcon icon={faMoon} width="0.5em" />
              ) : (
                <FontAwesomeIcon icon={faSun} width="0.8em" />
              )}
            </S.Circle>
          </S.DayNightSwitch>
        </S.Wrapper>
      </div>
      <style jsx>
        {`
          :global(.darkmode-wrapper) {
            border: 2px solid var(--white);
            border-radius: 30px !important;
            outline: none;
          }
        `}
      </style>
    </ThemeProvider>
  )
}

export default DarkmodeSwitch
