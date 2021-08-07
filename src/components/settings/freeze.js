import React, { useEffect, useRef, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import Select from "react-select"
import { StartDateTime, EndDateTime } from "@/newtelco/ag-grid"
import Flatpickr from "react-flatpickr"
import "flatpickr/dist/themes/airbnb.css"
import moment from "moment-timezone"
import "ag-grid-community/dist/styles/ag-grid.css"
import "ag-grid-community/dist/styles/ag-theme-material.css"
import Notify from "@/newtelco-utils/notification"
import ConfirmModal from "@/newtelco/confirmmodal"
import {
  Panel,
  Button,
  IconButton,
  ButtonGroup,
  Icon,
  Modal,
  FlexboxGrid,
  Form,
  FormGroup,
  Input,
  ControlLabel,
  HelpBlock,
  Loader,
} from "rsuite"

const Freeze = (props) => {
  const gridApi = useRef()
  const [openFreezeAdd, setOpenFreezeAdd] = useState(false)
  const [openConfirmDeleteModal, setOpenConfirmDelete] = useState(false)
  const [rowData, setRowData] = useState([])
  const [companySelections, setCompanySelections] = useState([])
  const [newCompany, setNewCompany] = useState({})
  const [newNotes, setNewNotes] = useState("")
  const [newStartDateTime, setNewStartDateTime] = useState("")
  const [newEndDateTime, setNewEndDateTime] = useState("")
  const [freezeIdToDelete, setFreezeIdToDelete] = useState("")
  const [freezeCompanyToDelete, setFreezeCompanyToDelete] = useState("")
  const gridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      selectable: true,
      editable: true,
    },
    columnDefs: [
      {
        headerName: "ID",
        field: "id",
        width: 80,
        editable: false,
        sort: { direction: "asc", priority: 1 },
      },
      {
        headerName: "Company",
        field: "name",
        width: 200,
        editable: false,
      },
      {
        headerName: "Start Date",
        field: "startDateTime",
        width: 200,
        cellRenderer: "startdateTime",
      },
      {
        headerName: "End Date",
        field: "endDateTime",
        width: 200,
        cellRenderer: "enddateTime",
      },
      {
        headerName: "Notes",
        field: "notes",
        width: 300,
      },
    ],
    rowSelection: "single",
    frameworkComponents: {
      startdateTime: StartDateTime,
      enddateTime: EndDateTime,
      customLoadingOverlay: Loader,
    },
    loadingOverlayComponent: "customLoadingOverlay",
  }

  useEffect(() => {
    fetch("/api/freeze", {
      method: "get",
    })
      .then((resp) => resp.json())
      .then((data) => {
        gridApi.current.hideOverlay()
        setRowData(data.freezeQuery)
      })
      .catch((err) => console.error(err))
    // fill Companies Select
    fetch("/api/companies/selectmaint", {
      method: "get",
    })
      .then((resp) => resp.json())
      .then((data) => {
        setCompanySelections(data.companies)
      })
      .catch((err) => console.error(`Error - ${err}`))
  }, [])

  const handleGridReady = (params) => {
    gridApi.current = params.api
    gridApi.current.showLoadingOverlay()
    params.api.sizeColumnsToFit()
  }

  const toggleFreezeAddModal = () => {
    setOpenFreezeAdd(!openFreezeAdd)
  }

  const handleCompanyChange = (selectedOption) => {
    setNewCompany({
      value: selectedOption.value,
      label: selectedOption.label,
    })
  }

  const handleNotesChange = (event) => {
    setNewNotes(event.target.value)
  }

  const handleNewStartChange = (date) => {
    const startDate = moment(date[0]).format("YYYY-MM-DD HH:mm:ss")
    setNewStartDateTime(startDate)
  }

  const handleNewEndChange = (date) => {
    const endDate = moment(date[0]).format("YYYY-MM-DD HH:mm:ss")
    setNewEndDateTime(endDate)
  }

  const handleDelete = () => {
    fetch(`/api/settings/delete/freeze?id=${freezeIdToDelete}`, {
      method: "get",
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (data.deleteFreezeQuery.affectedRows === 1) {
          Notify("success", `Freeze for ${freezeCompanyToDelete} Deleted`)
        } else {
          Notify("warning", "Error", data.err)
        }
      })
      .catch((err) => console.error(err))

    const newRowData = rowData.filter((el) => el.id !== freezeIdToDelete)
    setRowData(newRowData)
    setOpenConfirmDelete(!openConfirmDeleteModal)
  }

  const toggleFreezeDeleteModal = () => {
    if (gridApi.current) {
      const row = gridApi.current.getSelectedRows()
      if (row[0]) {
        const freezeId = row[0].id
        const freezeCompany = row[0].name
        setOpenConfirmDelete(!openConfirmDeleteModal)
        setFreezeIdToDelete(freezeId)
        setFreezeCompanyToDelete(freezeCompany)
      } else {
        Notify("warning", "Please select a freeze")
      }
    }
  }

  const handleFreezeAdd = () => {
    fetch(
      `/api/settings/add/freeze?companyid=${encodeURIComponent(
        newCompany.value
      )}&startdatetime=${encodeURIComponent(
        newStartDateTime
      )}&enddatetime=${encodeURIComponent(
        newEndDateTime
      )}&notes=${encodeURIComponent(newNotes)}`,
      {
        method: "get",
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        const insertId = data.insertFreezeQuery.insertId
        const newCompanyName = newCompany.label
        if (
          data.insertFreezeQuery.affectedRows === 1 &&
          data.insertFreezeQuery.warningCount === 0
        ) {
          Notify("success", `Freeze for ${newCompanyName} Added`)
        } else {
          Notify("warning", "Error", data.err)
        }
        const newRowData = rowData
        newRowData.push({
          id: insertId,
          name: newCompany.label,
          companyId: newCompany.value,
          startDateTime: newStartDateTime,
          endDateTime: newEndDateTime,
          notes: newNotes,
        })
        setRowData(newRowData)
        setOpenFreezeAdd(!openFreezeAdd)
        setNewCompany({
          value: "",
          label: "",
        })
        setNewStartDateTime()
        setNewEndDateTime()
        gridApi.current.setRowData(newRowData)
      })
      .catch((err) => console.error(err))
  }

  const handleCellEdit = (params) => {
    const id = params.data.id
    const startdate = moment(params.data.startDateTime).format(
      "YYYY.MM.DD HH:mm:ss"
    )
    const enddate = moment(params.data.endDateTime).format(
      "YYYY.MM.DD HH:mm:ss"
    )
    const notes = params.data.notes

    fetch(
      `/api/settings/edit/freeze?id=${id}&startdate=${encodeURIComponent(
        startdate
      )}&enddate=${encodeURIComponent(enddate)}&notes=${encodeURIComponent(
        notes
      )}`,
      {
        method: "get",
      }
    )
      .then((resp) => resp.json())
      .then((data) => {
        if (data.updateFreezeQuery.affectedRows === 1) {
          Notify("success", `${params.data.name} Freeze Updated`)
        } else {
          Notify("warning", "Error", data.err)
        }
      })
      .catch((err) => console.error(err))
  }

  const Header = () => {
    return (
      <FlexboxGrid justify="end" align="middle">
        <FlexboxGrid.Item>
          <ButtonGroup>
            <IconButton
              onClick={toggleFreezeAddModal}
              icon={<Icon icon="plus-circle" />}
              appearance="ghost"
              placement="right"
            >
              Add
            </IconButton>
            <IconButton
              onClick={toggleFreezeDeleteModal}
              icon={<Icon icon="trash" />}
              appearance="ghost"
              placement="right"
            >
              Delete
            </IconButton>
          </ButtonGroup>
        </FlexboxGrid.Item>
      </FlexboxGrid>
    )
  }

  return (
    <div style={{ width: "100%" }} className="section">
      <Panel header={<Header />}>
        <div
          className="ag-theme-material"
          style={{
            height: "700px",
            width: "100%",
          }}
        >
          <AgGridReact
            gridOptions={gridOptions}
            onGridReady={handleGridReady}
            animateRows
            onCellEditingStopped={handleCellEdit}
            rowData={rowData}
            stopEditingWhenGridLosesFocus
            immutableData
            getRowNodeId={(data) => {
              return data.id
            }}
          />
        </div>
      </Panel>
      {openConfirmDeleteModal && (
        <ConfirmModal
          show={openConfirmDeleteModal}
          onHide={toggleFreezeDeleteModal}
          header="Confirm Delete"
          content={`Are you sure you want to delete ${freezeCompanyToDelete} (${freezeIdToDelete})`}
          cancelAction={toggleFreezeDeleteModal}
          confirmAction={handleDelete}
        />
      )}
      {openFreezeAdd && (
        <Modal
          backdrop
          show={openFreezeAdd}
          size="xs"
          onHide={toggleFreezeAddModal}
        >
          <Modal.Header>New Freeze</Modal.Header>
          <Modal.Body style={{ paddingBottom: "0px" }}>
            <FlexboxGrid
              justify="space-around"
              align="middle"
              style={{ flexDirection: "column", height: "450px" }}
            >
              <FlexboxGrid.Item
                style={{ fontFamily: "var(--font-body)", fontSize: "1.1rem" }}
              >
                <Form>
                  <FormGroup>
                    <ControlLabel>Customer</ControlLabel>
                    <Select
                      value={newCompany}
                      className="company-select"
                      onChange={handleCompanyChange}
                      options={companySelections}
                      noOptionsMessage={() => "No Companies Available"}
                      placeholder="Please Select a Company"
                      style={{ zIndex: "9999" }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Start Date/Time (in GMT)</ControlLabel>
                    <Flatpickr
                      value={newStartDateTime}
                      data-enable-time
                      className="flatpickr"
                      onChange={handleNewStartChange}
                      options={{
                        time_24hr: "true",
                        allowInput: "true",
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>End Date/Time (in GMT)</ControlLabel>
                    <Flatpickr
                      value={newEndDateTime}
                      data-enable-time
                      className="flatpickr"
                      onChange={handleNewEndChange}
                      options={{
                        time_24hr: "true",
                        allowInput: "true",
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <ControlLabel>Notes</ControlLabel>
                    <Input
                      name="notes"
                      type="text"
                      componentClass="textarea"
                      value={newNotes}
                      onChange={(value) => setNewNotes(value)}
                    />
                  </FormGroup>
                </Form>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item>
                <ButtonGroup block style={{ width: "20em" }}>
                  <Button
                    appearance="default"
                    onClick={toggleFreezeAddModal}
                    style={{ width: "50%" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    appearance="primary"
                    onClick={handleFreezeAdd}
                    style={{ width: "50%" }}
                  >
                    Confirm
                  </Button>
                </ButtonGroup>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </Modal.Body>
        </Modal>
      )}
    </div>
  )
}

Freeze.getInitialProps = async ({ req }) => {
  const host = req && (req.headers["x-forwarded-host"] ?? req.headers["host"])
  let protocol = "https:"
  if (host.indexOf("localhost") > -1) {
    protocol = "http:"
  }
  const pageRequest = `${protocol}//${host}/api/settings/freeze`
  const res = await fetch(pageRequest)
  const json = await res.json()
  return {
    jsonData: json,
  }
}

export default Freeze
