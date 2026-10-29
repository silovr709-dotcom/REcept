/**
 * БОКОВИНЫ КОРПУСА
 * ================
 * Две вертикальные линии по краям колонки, которые стоят на месте, пока
 * страница едет мимо. Это боковины короба: содержимое не «лежит на
 * фоне», а находится внутри корпуса, как полки внутри шкафа.
 *
 * Линия одна и та же на кремовом и на тёмно-синем: тёплый серый в
 * половину силы читается на обоих, но ни на одном не спорит с текстом.
 * Ниже 1280 px боковин нет — на узком экране корпус шире экрана, и
 * рисовать его стенки бессмысленно.
 *
 * Элемент декоративный: он скрыт от программ чтения с экрана и не
 * ловит курсор.
 */
export function Carcass() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 hidden xl:block"
    >
      {/* Линии стоят ровно по краю колонки с текстом, а не по краю
          экрана: боковина корпуса проходит там, где начинается
          содержимое */}
      <div className="container-page relative h-full">
        <span className="absolute inset-y-0 left-(--spacing-gutter) w-px bg-clay/30" />
        <span className="absolute inset-y-0 right-(--spacing-gutter) w-px bg-clay/30" />
        {/* Латунная засечка посередине боковины — отметка, по которой
            в цеху сверлят отверстие под полкодержатель */}
        <span className="absolute left-(--spacing-gutter) top-1/2 h-20 w-px -translate-y-1/2 bg-goldline/45" />
        <span className="absolute right-(--spacing-gutter) top-1/2 h-20 w-px -translate-y-1/2 bg-goldline/45" />
      </div>
    </div>
  );
}
