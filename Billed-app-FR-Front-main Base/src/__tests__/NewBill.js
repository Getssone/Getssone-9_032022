/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeTruthy() // valeur est convertie en booléen =valeur viable
    })
  })

  //sur la page NewBill, le formulaire doit être chargée
  describe("When I am on NewBill Page", () => {
    test("Then the new bill's form should be loaded with its fields", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
      expect(screen.getByRole("button")).toBeTruthy();
    })


    test('Then I can select upload an image file', () => {
      const html = NewBillUI();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "azerty@email.com",
      }))
      document.body.innerHTML = html;
      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          create: () => {
            return Promise.resolve({})
          },
        }
      })

      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const mockHandleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputJustificative = screen.getByTestId("file");
      expect(inputJustificative).toBeTruthy();
      const file = new File(["file"], "file.jpg", { type: "image/jpeg" })

      // Je simule que le fichier est un jpg
      inputJustificative.addEventListener("change", mockHandleChangeFile);
      fireEvent.change(inputJustificative, {
        target: {
          files: [file],
        },
      });

      expect(mockHandleChangeFile).toHaveBeenCalled();
      expect(inputJustificative.files).toHaveLength(1);
      expect(inputJustificative.files[0].name).toBe("file.jpg");

      jest.spyOn(window, "alert").mockImplementation(() => {
      });
      expect(window.alert).not.toHaveBeenCalled();
    })

    //Test d'alert
    test("Then I can't select upload a non image file", () => {
      // Mock Alert
      const html = NewBillUI();
      document.body.innerHTML = html;

      const store = null;
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      // Je mock la function handleChangeFile()
      const mockHandleChangeFile = jest.fn(newBill.handleChangeFile);

      const inputJustificative = screen.getByTestId("file");
      expect(inputJustificative).toBeTruthy();

     // Je simule que le fichier est au mauvais format (il n'est pas un jpg, png ou jpeg)
      inputJustificative.addEventListener("change", mockHandleChangeFile);
      fireEvent.change(inputJustificative, {
        target: {
          // object File ([fichier], "nomDuFichier", {type: "typeDuFichier"})
          files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
        },
      });
      expect(mockHandleChangeFile).toHaveBeenCalled();
      expect(inputJustificative.files[0].name).not.toBe("file.jpg");

      jest.spyOn(window, "alert").mockImplementation(() => {
      });
      expect(window.alert).toHaveBeenCalled();
    })
  })
})

describe('Given I am a user connected as Employee', () => {
  describe("When I submit the form completed", () => {
    test("Then the bill is created", async () => {

      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "azerty@email.com",
      }))

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })

      const validBill = {
        type: "Transport",
        name: "Vol France Chine",
        date: "2022-04-14",
        amount: 600,
        vat: 0,
        pct: 2,
        commentary: "RAS",
        fileUrl: "../img/0.jpg",
        fileName: "Billet-avion-test.jpg",
        status: "pending"
      };

      // Intégration des valeurs dans les champs
      screen.getByTestId("expense-type").value = validBill.type;
      screen.getByTestId("expense-name").value = validBill.name;
      screen.getByTestId("datepicker").value = validBill.date;
      screen.getByTestId("amount").value = validBill.amount;
      screen.getByTestId("vat").value = validBill.vat;
      screen.getByTestId("pct").value = validBill.pct;
      screen.getByTestId("commentary").value = validBill.commentary;

      newBill.fileName = validBill.fileName
      newBill.fileUrl = validBill.fileUrl;

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form)

      expect(handleSubmit).toHaveBeenCalled()
      expect(newBill.updateBill).toHaveBeenCalled()

    })

    test('fetches error from an API and fails with 500 error', async () => {
      
      //console.log("présente", mockStore)
      jest.spyOn(mockStore, 'bills')
      //console.log("présente-2", mockStore)
      jest.spyOn(console, 'error').mockImplementation(() => {
      })// Renvoie le code erreur de jest dans la console

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = `<div id="root"></div>`
      router()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
          list: () => {
            return Promise.reject(new Error('Erreur 500'))
          }
        }
      })
      const newBill = new NewBill({ 
        document, 
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      // Envoie du Formulaire
      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()
    })
  })
})