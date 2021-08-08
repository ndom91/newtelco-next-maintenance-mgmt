export const EdittedBy = ({ node }) => {
  let avatarFile = "avatar.svg"
  if (node?.data?.bearbeitetvon) {
    avatarFile = `${node.data.bearbeitetvon}.png`
  }
  return (
    <>
      <span className="user-pic-wrapper">
        <img
          className="user-pic"
          style={{ border: "2px solid #67B246", borderRadius: "50%" }}
          src={`/static/images/avatars/${avatarFile}`}
          alt="User Avatar"
          width="32px"
          height="32px"
        />
      </span>
    </>
  )
}
