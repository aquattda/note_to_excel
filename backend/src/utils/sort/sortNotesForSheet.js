function toAnnotationValue(annotation) {
  return typeof annotation === 'string' ? annotation.trim() : '';
}

function sortNotesForSheet(notes) {
  return [...notes].sort((a, b) => {
    const aAnnotation = toAnnotationValue(a.annotation);
    const bAnnotation = toAnnotationValue(b.annotation);
    const aHasAnnotation = aAnnotation.length > 0;
    const bHasAnnotation = bAnnotation.length > 0;

    if (aHasAnnotation && !bHasAnnotation) {
      return -1;
    }
    if (!aHasAnnotation && bHasAnnotation) {
      return 1;
    }

    if (aHasAnnotation && bHasAnnotation) {
      const annotationCompare = aAnnotation.localeCompare(bAnnotation, 'vi', {
        sensitivity: 'base'
      });
      if (annotationCompare !== 0) {
        return annotationCompare;
      }
    }

    const aCreatedAt = new Date(a.createdAt).getTime();
    const bCreatedAt = new Date(b.createdAt).getTime();
    return aCreatedAt - bCreatedAt;
  });
}

module.exports = { sortNotesForSheet };
