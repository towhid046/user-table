import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

const App: React.FC = () => {
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(12);
  const [products, setProducts] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<Artwork[]>([]);
  const [localSelection, setLocalSelection] = useState<Set<number>>(new Set());

  const [visible, setVisible] = useState(false); // Modal visibility state
  const [inputValue, setInputValue] = useState(""); // Store input number

  // Load data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const page = Math.floor(first / rows) + 1;
        const response = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${page}`
        );
        const data = await response.json();
        setProducts(data.data);
        setTotalRecords(60);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, [first, rows]);

  // Handle page change
  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  // Handle row selection (when items are checked)
  const onSelectionChange = (e: any) => {
    const selected = e.value;
    setSelectedProducts(selected);

    const selectedIds = new Set(selected.map((item: Artwork) => item.id));
    setLocalSelection(selectedIds);

    // Persist selection in localStorage
    const savedSelections = JSON.parse(
      localStorage.getItem("selectedProducts") || "[]"
    );
    const updatedSelections = [
      ...new Set([...savedSelections, ...Array.from(selectedIds)]),
    ];
    localStorage.setItem("selectedProducts", JSON.stringify(updatedSelections));
  };

  // Load selected items from localStorage when component mounts
  useEffect(() => {
    const savedSelection = localStorage.getItem("selectedProducts");
    if (savedSelection) {
      setLocalSelection(new Set(JSON.parse(savedSelection)));
    }
  }, []);

  const isSelected = (rowData: Artwork) => localSelection.has(rowData.id);

  // Handle modal opening
  const openModal = () => {
    setVisible(true);
  };

  // Handle modal submission and check rows
  const handleSubmit = () => {
    const numberOfItemsToCheck = parseInt(inputValue, 10);

    if (!isNaN(numberOfItemsToCheck) && numberOfItemsToCheck > 0) {
      const newSelectedProducts = products.slice(0, numberOfItemsToCheck);
      setSelectedProducts(newSelectedProducts);

      const selectedIds = new Set(newSelectedProducts.map((item) => item.id));
      setLocalSelection(selectedIds);

      // Save to localStorage
      const savedSelections = JSON.parse(
        localStorage.getItem("selectedProducts") || "[]"
      );
      const updatedSelections = [
        ...new Set([...savedSelections, ...Array.from(selectedIds)]),
      ];
      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(updatedSelections)
      );
    }

    setVisible(false); // Close modal
  };

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Artworks Table</h1>

      {/* Icon in Title Column */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <i
          className="pi pi-chevron-down"
          style={{ cursor: "pointer", marginRight: "5px" }}
          onClick={openModal}
        ></i>
        <span>Title</span>
      </div>

      {/* Table */}
      <DataTable
        value={products}
        responsiveLayout="scroll"
        selection={selectedProducts}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        rowClassName={(rowData) => (isSelected(rowData) ? "p-highlight" : "")}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3em" }}
        ></Column>
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Start Date"></Column>
        <Column field="date_end" header="End Date"></Column>
      </DataTable>

      {/* Paginator */}
      <Paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />

      {/* Modal */}
      <Dialog
        header="Select Number of Items to Check"
        visible={visible}
        style={{ width: "30vw" }}
        onHide={() => setVisible(false)}
      >
        <div className="p-field">
          <label htmlFor="number">Enter a number</label>
          <InputText
            id="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: "100%" }}
            keyfilter="int"
          />
        </div>
        <Button label="Submit" onClick={handleSubmit} />
      </Dialog>
    </div>
  );
};

export default App;
