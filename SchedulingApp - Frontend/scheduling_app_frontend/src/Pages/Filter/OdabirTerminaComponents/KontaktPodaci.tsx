import PhoneInput from "react-phone-input-2";

interface UserInput {
  name: string;
  email: string;
  phoneNumber: string;
}

interface KontaktPodaciProps {
  userInput: UserInput;
  onUserInput: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    fieldName?: string
  ) => void;
  onOtkaziRezervaciju: () => void;
  onVasaRezervacija: () => void;
}

export default function KontaktPodaci({
  userInput,
  onUserInput,
  onOtkaziRezervaciju,
  onVasaRezervacija,
}: KontaktPodaciProps) {
  return (
    <div className="p-4 border rounded shadow slide-in-bottom">
      <h4>Kontakt podaci</h4>
      <form className="col-10 mx-auto" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group mt-3">
          Ime:
          <input
            type="text"
            value={userInput.name}
            className="form-control"
            placeholder="Ime..."
            name="name"
            required
            onChange={(e) => onUserInput(e)}
          />
        </div>
        <div className="form-group mt-3">
          Email:
          <input
            type="email"
            value={userInput.email}
            className="form-control"
            placeholder="E-mail"
            name="email"
            required
            onChange={(e) => onUserInput(e)}
          />
        </div>
        <div className="form-group mt-3">
          Broj Telefona:
          <PhoneInput
            country={"rs"}
            value={userInput.phoneNumber}
            onChange={(value: string) => onUserInput(value, "phoneNumber")}
            inputProps={{
              name: "phoneNumber",
              required: true,
            }}
          />
        </div>
      </form>
      <hr />
      <div className="d-flex justify-content-end mt-3">
        <button
          className="btn btn-outline-secondary mx-2"
          type="button"
          onClick={onOtkaziRezervaciju}
        >
          Otkaži
        </button>
        <button
          className="btn btn-success"
          type="button"
          onClick={onVasaRezervacija}
        >
          Nastavi
        </button>
      </div>
    </div>
  );
}
