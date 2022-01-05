## Manual Regression Testing

### Short List  
- Create a table
- Add your own dataset
- Density
- Striped
- Resize columns
- Remove columns
- Resize row height
- Change state of columns
- Generic lorem
- Email lorem header
- Email lorem body

---
### Long List

1. *Resize Column* **Resize a header width** should resize body column accordingly
1. *Resize Cell* **Resize a header/body column width** should refill the all cell text according to the column width
1. *Resize Column* **Resize a body column width** should resize its header accordingly
1. *Resize Row* **Resize a body cell height** should adjust height for the whole row accordingly
1. *Striped* Select a table and **Change striped** should toggle table from striped to non-striped
1. *Row Mouse State* **Change a cell comp mouse state** should change the mouse state for the whole row, including the pinned (left/right) columns accordingly  
    1. Default - Hover/ Pressed  
    1. Default Alt - Hover / Pressed  
    1. Default / Line - Hover / Pressed  
    1. Default Alt / Line - Hover / Pressed  
1. *Vertical Density* Select a table and **Change row height (vertial density)** should change height for all the rows in the table, except for the ones that have their height manually set (table with variable row heights) 
    1. compact
    1. normal
    1. cozy
    1. spacious
1. *Data Source*
    1. Custom dataset
    1. Canned datasets
1. *Lorem*
    1. Generic lorem
    1. Email lorem in header
    1. Email lorem in cell

